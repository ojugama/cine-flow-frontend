import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Row,
  Col,
  Spinner,
  Table,
} from "react-bootstrap";
import PaginationBar from "../components/PaginationBar";
import {
  closeAlert,
  confirmAction,
  notifyError,
  notifySuccess,
  showLoading,
} from "../utils/alerts";
import {
  createPelicula,
  deletePelicula,
  listPeliculas,
  updatePelicula,
  uploadPeliculaImagen,
} from "../services/peliculasService";
import { resolveImageUrl } from "../utils/format";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const emptyForm = {
  titulo: "",
  genero: "",
  duracionMinutos: "",
  sinopsis: "",
  imagenUrl: "",
};

function PosterThumb({ movie }) {
  const [failed, setFailed] = useState(false);
  const src = resolveImageUrl(movie.imagenUrl);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) return <span className="text-muted">—</span>;

  return (
    <img
      src={src}
      alt=""
      className="cf-admin-thumb"
      onError={() => setFailed(true)}
    />
  );
}

export default function AdminPeliculasPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [movies, setMovies] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const formCardRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const loadPeliculas = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await listPeliculas({ page, size, sort: "id,asc" });
      setMovies(response.data?.content ?? []);
      setMeta(response.data ?? null);
    } catch (requestError) {
      setMovies([]);
      setMeta(null);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    loadPeliculas();
  }, [loadPeliculas]);

  useEffect(() => {
    if (formOpen) {
      formCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [formOpen]);

  function handleSizeChange(event) {
    setSize(Number(event.target.value));
    setPage(0);
  }

  function resetImageSelection() {
    setImageFile(null);
    setImagePreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
    setFieldErrors({});
    resetImageSelection();
  }

  function openCreate() {
    resetForm();
    setFormOpen(true);
  }

  function openEdit(movie) {
    setEditingId(movie.id);
    setForm({
      titulo: movie.titulo ?? "",
      genero: movie.genero ?? "",
      duracionMinutos: movie.duracionMinutos ?? "",
      sinopsis: movie.sinopsis ?? "",
      imagenUrl: movie.imagenUrl ?? "",
    });
    setFormError("");
    setFieldErrors({});
    resetImageSelection();
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    resetForm();
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type)) {
      setFieldErrors((current) => ({
        ...current,
        imagen: "Formato no permitido. Usa una imagen JPG, PNG, WEBP o GIF.",
      }));
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setFieldErrors((current) => ({
        ...current,
        imagen: "La imagen debe pesar máximo 5 MB.",
      }));
      event.target.value = "";
      return;
    }

    setFieldErrors((current) => ({ ...current, imagen: undefined }));
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  }

  function handleRemoveFile() {
    resetImageSelection();
    setFieldErrors((current) => ({ ...current, imagen: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setFieldErrors({});

    const duration = Number(form.duracionMinutos);

    if (!form.titulo.trim()) {
      setFieldErrors({ titulo: "El título es obligatorio." });
      return;
    }

    if (!Number.isInteger(duration) || duration < 1) {
      setFieldErrors({
        duracionMinutos:
          "La duración debe ser un número entero mayor que cero.",
      });
      return;
    }

    const data = {
      titulo: form.titulo.trim(),
      genero: form.genero.trim() || null,
      duracionMinutos: duration,
      sinopsis: form.sinopsis.trim() || null,
      imagenUrl: form.imagenUrl.trim() || null,
    };

    setSaving(true);
    const wasEditing = editingId !== null;
    let savedId = editingId;

    try {
      if (wasEditing) {
        await updatePelicula(editingId, data);
      } else {
        const created = await createPelicula(data);
        savedId = created?.data?.id ?? null;
        if (savedId != null) {
          setEditingId(savedId);
        }
      }

      if (imageFile) {
        if (savedId == null) {
          throw new Error(
            "No se pudo obtener el ID de la película para subir la imagen.",
          );
        }
        const uploaded = await uploadPeliculaImagen(savedId, imageFile);
        if (uploaded?.data?.imagenUrl) {
          setForm((current) => ({
            ...current,
            imagenUrl: uploaded.data.imagenUrl,
          }));
        }
      }

      closeForm();
      notifySuccess(
        wasEditing
          ? "Se ha editado la película."
          : "Se ha creado la película.",
      );
      await loadPeliculas();
    } catch (requestError) {
      if (requestError.data && typeof requestError.data === "object") {
        setFieldErrors(requestError.data);
      } else {
        setFormError(requestError.message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(movie) {
    const confirmed = await confirmAction({
      title: "Eliminar película",
      text: `Vas a eliminar la película ${movie.titulo}. Esta acción no se puede deshacer.`,
      confirmButtonText: "Eliminar película",
    });

    if (!confirmed) return;

    showLoading("Eliminando película...");

    try {
      await deletePelicula(movie.id);

      if (editingId === movie.id) {
        closeForm();
      }
      if (movies.length === 1 && page > 0) {
        setPage((current) => current - 1);
      }

      closeAlert();
      notifySuccess("Se ha eliminado la película.");
      await loadPeliculas();
    } catch (requestError) {
      closeAlert();
      notifyError(requestError.message);
    }
  }

  const posterPreviewSrc = imagePreviewUrl || resolveImageUrl(form.imagenUrl);

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h1 className="h3 fw-bold mb-1">
            <i className="fa-solid fa-clapperboard me-2 text-primary" />
            Películas
          </h1>
          <p className="text-muted mb-0">
            Administra el catálogo de películas de CineFlow.
          </p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <Form.Label
              htmlFor="page-size"
              className="mb-0 small text-muted text-nowrap"
            >
              Filas por página
            </Form.Label>
            <Form.Select
              id="page-size"
              size="sm"
              className="w-auto"
              value={size}
              onChange={handleSizeChange}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Form.Select>
          </div>
          <Button onClick={openCreate}>
            <i className="fa-solid fa-plus me-1" />
            Crear película
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {formOpen && (
        <Card className="border-0 shadow-sm mb-4" ref={formCardRef}>
          <Card.Body>
            <h2 className="h5 fw-bold">
              {editingId ? "Editar película" : "Crear película"}
            </h2>

            <Form noValidate onSubmit={handleSubmit}>
              {formError && <Alert variant="danger">{formError}</Alert>}

              <Row className="g-3">
                <Col md={6}>
                  <Form.Group controlId="titulo">
                    <Form.Label>Título</Form.Label>
                    <Form.Control
                      type="text"
                      name="titulo"
                      maxLength={100}
                      value={form.titulo}
                      onChange={handleChange}
                      isInvalid={Boolean(fieldErrors.titulo)}
                      required
                    />
                    {fieldErrors.titulo && (
                      <div className="invalid-feedback d-block">
                        {fieldErrors.titulo}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="genero">
                    <Form.Label>Género</Form.Label>
                    <Form.Control
                      type="text"
                      name="genero"
                      maxLength={100}
                      value={form.genero}
                      onChange={handleChange}
                      isInvalid={Boolean(fieldErrors.genero)}
                    />
                    {fieldErrors.genero && (
                      <div className="invalid-feedback d-block">
                        {fieldErrors.genero}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group controlId="duracionMinutos">
                    <Form.Label>Duración (minutos)</Form.Label>
                    <Form.Control
                      type="number"
                      name="duracionMinutos"
                      min={1}
                      step={1}
                      value={form.duracionMinutos}
                      onChange={handleChange}
                      isInvalid={Boolean(fieldErrors.duracionMinutos)}
                      required
                    />
                    {fieldErrors.duracionMinutos && (
                      <div className="invalid-feedback d-block">
                        {fieldErrors.duracionMinutos}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Group controlId="sinopsis">
                    <Form.Label>Sinopsis</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="sinopsis"
                      rows={4}
                      value={form.sinopsis}
                      onChange={handleChange}
                      isInvalid={Boolean(fieldErrors.sinopsis)}
                    />
                    {fieldErrors.sinopsis && (
                      <div className="invalid-feedback d-block">
                        {fieldErrors.sinopsis}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Group controlId="imagen-pelicula">
                    <Form.Label>Imagen de la cartelera</Form.Label>
                    <div className="d-flex flex-wrap align-items-start gap-3">
                      <div className="cf-admin-poster-preview">
                        {posterPreviewSrc ? (
                          <img src={posterPreviewSrc} alt="Vista previa del póster" />
                        ) : (
                          <i className="fa-solid fa-clapperboard" />
                        )}
                      </div>
                      <div className="flex-grow-1">
                        <Form.Control
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                          isInvalid={Boolean(fieldErrors.imagen)}
                        />
                        <Form.Text className="text-muted d-block mt-1">
                          JPG, PNG, WEBP o GIF · máximo 5 MB. El archivo
                          reemplaza la URL si ambas están definidas.
                        </Form.Text>
                        {imageFile && (
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0"
                            onClick={handleRemoveFile}
                            disabled={saving}
                          >
                            Quitar archivo seleccionado
                          </Button>
                        )}
                        {fieldErrors.imagen && (
                          <div className="invalid-feedback d-block">
                            {fieldErrors.imagen}
                          </div>
                        )}
                        <Form.Label className="mt-3">
                          O pegar una URL de imagen
                        </Form.Label>
                        <Form.Control
                          type="url"
                          name="imagenUrl"
                          maxLength={500}
                          placeholder="https://ejemplo.com/poster.jpg"
                          value={form.imagenUrl}
                          onChange={handleChange}
                          isInvalid={Boolean(fieldErrors.imagenUrl)}
                        />
                        {fieldErrors.imagenUrl && (
                          <div className="invalid-feedback d-block">
                            {fieldErrors.imagenUrl}
                          </div>
                        )}
                      </div>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex gap-2 mt-3">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        className="me-2"
                      />
                      Guardando...
                    </>
                  ) : editingId ? (
                    <>
                      <i className="fa-solid fa-floppy-disk me-1" />
                      Guardar cambios
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-floppy-disk me-1" />
                      Guardar película
                    </>
                  )}
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancelar
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <div className="table-responsive">
          <Table hover align-middle className="mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Imagen</th>
                <th>Género</th>
                <th>Duración</th>
                <th>Sinopsis</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    Cargando películas...
                  </td>
                </tr>
              ) : movies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No hay películas registradas.
                  </td>
                </tr>
              ) : (
                movies.map((movie) => (
                  <tr key={movie.id}>
                    <td className="fw-bold">{movie.id}</td>
                    <td className="fw-semibold">{movie.titulo}</td>
                    <td>
                      <PosterThumb movie={movie} />
                    </td>
                    <td>{movie.genero || "—"}</td>
                    <td>{movie.duracionMinutos} min</td>
                    <td
                      className="text-break"
                      style={{ minWidth: 220, maxWidth: 420 }}
                    >
                      {movie.sinopsis || "—"}
                    </td>
                    <td className="text-end text-nowrap">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-1"
                        onClick={() => openEdit(movie)}
                      >
                        <i className="fa-solid fa-pen me-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(movie)}
                      >
                        <i className="fa-solid fa-trash me-1" />
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      <PaginationBar
        page={meta?.number ?? page}
        totalPages={meta?.totalPages ?? 0}
        totalElements={meta?.totalElements ?? 0}
        size={size}
        itemLabel="películas"
        onPageChange={setPage}
      />
    </>
  );
}
