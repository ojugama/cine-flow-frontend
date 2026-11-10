import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Row,
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
  createFuncion,
  deleteFuncion,
  getPeliculasOpcion,
  getSalasOpcion,
  listFunciones,
  updateFuncion,
} from "../services/funcionesService";
import {
  formatDateTime,
  normalizeList,
  toLocalInput,
} from "../utils/format";

const emptyForm = {
  idPelicula: "",
  idSala: "",
  fechaHoraInicio: "",
  fechaHoraFin: "",
};

function getAvailableRooms(formData, rooms, funciones, editingId) {
  const { fechaHoraInicio: start, fechaHoraFin: end } = formData;
  const validDates = start && end && new Date(end) > new Date(start);

  return rooms.filter((room) => {
    if (!validDates) return true;

    return !funciones.some(
      (funcion) =>
        funcion.id !== editingId &&
        funcion.idSala === room.id &&
        new Date(funcion.fechaHoraInicio) < new Date(end) &&
        new Date(funcion.fechaHoraFin) > new Date(start),
    );
  });
}

export default function AdminFuncionesPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [funciones, setFunciones] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const formCardRef = useRef(null);

  const loadFunciones = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await listFunciones({ page, size, sort: "id,asc" });
      setFunciones(normalizeList(response.data));
      setMeta(
        Array.isArray(response.data)
          ? null
          : (response.data?.page ?? response.data),
      );
    } catch (requestError) {
      setFunciones([]);
      setMeta(null);
      setPageError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        const [moviesResponse, roomsResponse] = await Promise.all([
          getPeliculasOpcion(),
          getSalasOpcion(),
        ]);

        if (!active) return;

        setMovies(normalizeList(moviesResponse.data));
        setRooms(normalizeList(roomsResponse.data));
      } catch (requestError) {
        if (active) setPageError(requestError.message);
      }
    }

    loadOptions();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    loadFunciones();
  }, [loadFunciones]);

  useEffect(() => {
    if (formOpen) {
      formCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [formOpen]);

  const availableRooms = (() => {
    const list = getAvailableRooms(form, rooms, funciones, editingId);

    if (
      editingId &&
      form.idSala &&
      !list.some((room) => room.id === Number(form.idSala))
    ) {
      const current = rooms.find((room) => room.id === Number(form.idSala));
      if (current) return [current, ...list];
    }

    return list;
  })();

  function calcularFechaFin(baseForm) {
    const next = { ...baseForm };
    const peliculaId = Number(next.idPelicula);

    if (peliculaId && next.fechaHoraInicio) {
      const pelicula = movies.find((movie) => movie.id === peliculaId);

      if (pelicula?.duracionMinutos) {
        const inicio = new Date(next.fechaHoraInicio);
        const fin = new Date(
          inicio.getTime() + pelicula.duracionMinutos * 60000,
        );
        const tzOffset = fin.getTimezoneOffset() * 60000;
        next.fechaHoraFin = new Date(fin.getTime() - tzOffset)
          .toISOString()
          .slice(0, 16);
      }
    }

    const disponibles = getAvailableRooms(
      next,
      rooms,
      funciones,
      editingId,
    );

    if (
      next.idSala &&
      !disponibles.some((room) => room.id === Number(next.idSala))
    ) {
      next.idSala = "";
    }

    return next;
  }

  function handleSizeChange(event) {
    setSize(Number(event.target.value));
    setPage(0);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "idPelicula" || name === "fechaHoraInicio") {
        return calcularFechaFin(next);
      }
      return next;
    });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
    setFieldErrors({});
  }

  function openCreate() {
    resetForm();
    setFormOpen(true);
  }

  function openEdit(funcion) {
    setEditingId(funcion.id);
    setForm({
      idPelicula: funcion.idPelicula ?? "",
      idSala: funcion.idSala ?? "",
      fechaHoraInicio: toLocalInput(funcion.fechaHoraInicio),
      fechaHoraFin: toLocalInput(funcion.fechaHoraFin),
    });
    setFormError("");
    setFieldErrors({});
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    resetForm();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setFieldErrors({});

    const idPelicula = Number(form.idPelicula);
    const idSala = Number(form.idSala);
    const { fechaHoraInicio, fechaHoraFin } = form;

    if (!idPelicula) {
      setFieldErrors({ idPelicula: "Selecciona una película." });
      return;
    }

    if (!idSala) {
      setFieldErrors({ idSala: "Selecciona una sala." });
      return;
    }

    if (!fechaHoraInicio || !fechaHoraFin) {
      setFormError("Las fechas de inicio y fin son obligatorias.");
      return;
    }

    if (new Date(fechaHoraFin) <= new Date(fechaHoraInicio)) {
      setFieldErrors({
        fechaHoraFin:
          "La fecha y hora de fin debe ser posterior a la de inicio.",
      });
      return;
    }

    const data = { idPelicula, idSala, fechaHoraInicio, fechaHoraFin };
    const wasEditing = editingId !== null;

    setSaving(true);

    try {
      if (wasEditing) {
        await updateFuncion(editingId, data);
      } else {
        await createFuncion(data);
      }

      closeForm();
      notifySuccess(
        wasEditing
          ? "Se ha actualizado la función."
          : "Se ha creado la función.",
      );
      await loadFunciones();
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

  function deleteLabel(funcion) {
    if (!funcion) return "";
    const pelicula =
      funcion.tituloPelicula || `Película ${funcion.idPelicula}`;
    const sala = funcion.nombreSala || `Sala ${funcion.idSala}`;
    return `${pelicula} (${sala} - ${formatDateTime(funcion.fechaHoraInicio)})`;
  }

  async function handleDelete(funcion) {
    const confirmed = await confirmAction({
      title: "Eliminar función",
      text: `Vas a eliminar la función de ${deleteLabel(funcion)}. Esta acción no se puede deshacer.`,
      confirmButtonText: "Eliminar función",
    });

    if (!confirmed) return;

    showLoading("Eliminando función...");

    try {
      await deleteFuncion(funcion.id);

      if (editingId === funcion.id) {
        closeForm();
      }
      if (funciones.length === 1 && page > 0) {
        setPage((current) => current - 1);
      }

      closeAlert();
      notifySuccess("Se ha eliminado la función.");
      await loadFunciones();
    } catch (requestError) {
      closeAlert();
      notifyError(requestError.message);
    }
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h1 className="h3 fw-bold mb-1">
            <i className="fa-solid fa-calendar-days me-2 text-primary" />
            Funciones
          </h1>
          <p className="text-muted mb-0">
            Programación de películas por sala y sucursal.
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
            Crear función
          </Button>
        </div>
      </div>

      {pageError && <Alert variant="danger">{pageError}</Alert>}

      {formOpen && (
        <Card className="border-0 shadow-sm mb-4" ref={formCardRef}>
          <Card.Body>
            <h2 className="h5 fw-bold">
              {editingId ? "Editar función" : "Crear función"}
            </h2>

            <Form noValidate onSubmit={handleSubmit}>
              {formError && <Alert variant="danger">{formError}</Alert>}

              <Row className="g-3">
                <Col md={6}>
                  <Form.Group controlId="idPelicula">
                    <Form.Label>Película</Form.Label>
                    <Form.Select
                      name="idPelicula"
                      value={form.idPelicula}
                      onChange={handleChange}
                      isInvalid={Boolean(fieldErrors.idPelicula)}
                      required
                    >
                      <option value="">Selecciona una película</option>
                      {movies.map((movie) => (
                        <option key={movie.id} value={movie.id}>
                          {movie.titulo} ({movie.duracionMinutos} min)
                        </option>
                      ))}
                    </Form.Select>
                    {fieldErrors.idPelicula && (
                      <div className="invalid-feedback d-block">
                        {fieldErrors.idPelicula}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="idSala">
                    <Form.Label>Sala / sucursal</Form.Label>
                    <Form.Select
                      name="idSala"
                      value={form.idSala}
                      onChange={handleChange}
                      isInvalid={Boolean(fieldErrors.idSala)}
                      required
                    >
                      <option value="">Selecciona una sala disponible</option>
                      {availableRooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.nombreSucursal || "Sucursal"}
                          {room.ciudadSucursal
                            ? ` (${room.ciudadSucursal})`
                            : ""}{" "}
                          — {room.nombre || `Sala ${room.id}`}
                          {room.formato ? ` · ${room.formato}` : ""}
                        </option>
                      ))}
                    </Form.Select>
                    {fieldErrors.idSala && (
                      <div className="invalid-feedback d-block">
                        {fieldErrors.idSala}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="fechaHoraInicio">
                    <Form.Label>Fecha y hora de inicio</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="fechaHoraInicio"
                      value={form.fechaHoraInicio}
                      onChange={handleChange}
                      isInvalid={Boolean(fieldErrors.fechaHoraInicio)}
                      required
                    />
                    {fieldErrors.fechaHoraInicio && (
                      <div className="invalid-feedback d-block">
                        {fieldErrors.fechaHoraInicio}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="fechaHoraFin">
                    <Form.Label>Fecha y hora de fin</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="fechaHoraFin"
                      value={form.fechaHoraFin}
                      readOnly
                      isInvalid={Boolean(fieldErrors.fechaHoraFin)}
                      required
                    />
                    {fieldErrors.fechaHoraFin && (
                      <div className="invalid-feedback d-block">
                        {fieldErrors.fechaHoraFin}
                      </div>
                    )}
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
                      Guardar función
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
                <th>Película</th>
                <th>Sucursal</th>
                <th>Sala</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    Cargando funciones...
                  </td>
                </tr>
              ) : funciones.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No hay funciones registradas.
                  </td>
                </tr>
              ) : (
                funciones.map((funcion) => (
                  <tr key={funcion.id}>
                    <td className="fw-bold">{funcion.id}</td>
                    <td className="fw-semibold">
                      {funcion.tituloPelicula ||
                        `Película ${funcion.idPelicula}`}
                    </td>
                    <td>
                      {funcion.nombreSucursal
                        ? `${funcion.nombreSucursal}${
                            funcion.ciudadSucursal
                              ? ` (${funcion.ciudadSucursal})`
                              : ""
                          }`
                        : "—"}
                    </td>
                    <td>
                      {funcion.nombreSala ? (
                        <>
                          {funcion.nombreSala}
                          {funcion.formatoSala && (
                            <Badge bg="secondary" className="ms-1">
                              {funcion.formatoSala}
                            </Badge>
                          )}
                        </>
                      ) : (
                        `Sala ${funcion.idSala}`
                      )}
                    </td>
                    <td>{formatDateTime(funcion.fechaHoraInicio)}</td>
                    <td>{formatDateTime(funcion.fechaHoraFin)}</td>
                    <td className="text-end text-nowrap">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-1"
                        onClick={() => openEdit(funcion)}
                      >
                        <i className="fa-solid fa-pen me-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(funcion)}
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
        itemLabel="funciones"
        onPageChange={setPage}
      />
    </>
  );
}
