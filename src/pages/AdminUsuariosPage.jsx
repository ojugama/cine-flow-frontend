import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Form,
  Modal,
  Spinner,
  Table,
} from "react-bootstrap";
import { useAuth } from "../auth/AuthContext";
import PaginationBar from "../components/PaginationBar";
import {
  closeAlert,
  confirmAction,
  notifyError,
  notifySuccess,
  showLoading,
} from "../utils/alerts";
import {
  desactivateUsuario,
  getUsuarios,
  updateUsuario,
} from "../services/usuariosService";

export default function AdminUsuariosPage() {
  const { session } = useAuth();

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    nombres: "",
    apellidos: "",
    email: "",
  });
  const [editErrors, setEditErrors] = useState({});
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const loadTable = useCallback(async () => {
    setLoading(true);
    setError("");

    const result = await getUsuarios({ page, size, sort: "id,asc" });

    setLoading(false);

    if (result.success) {
      setUsers(result.data);
      setMeta(result.pageData ?? null);
    } else {
      setUsers([]);
      setMeta(null);
      setError(result.message);
    }
  }, [page, size]);

  useEffect(() => {
    loadTable();
  }, [loadTable]);

  function handleSizeChange(event) {
    setSize(Number(event.target.value));
    setPage(0);
  }

  function openEdit(user) {
    setSelectedUser(user);
    setEditForm({
      nombres: user.nombres ?? "",
      apellidos: user.apellidos ?? "",
      email: user.email ?? "",
    });
    setEditErrors({});
    setEditError("");
    setEditOpen(true);
  }

  function handleEditChange(event) {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  }

  async function handleEditSubmit(event) {
    event.preventDefault();
    if (!selectedUser) return;

    setEditErrors({});
    setEditError("");
    setEditLoading(true);

    const result = await updateUsuario(selectedUser.id, {
      nombres: editForm.nombres.trim(),
      apellidos: editForm.apellidos.trim(),
      email: editForm.email.trim(),
    });

    setEditLoading(false);

    if (result.success) {
      setEditOpen(false);
      setSelectedUser(null);
      notifySuccess("Usuario actualizado correctamente.");
      await loadTable();
    } else if (result.errors && typeof result.errors === "object") {
      setEditErrors(result.errors);
    } else {
      setEditError(result.message);
    }
  }

  async function handleDelete(user) {
    const confirmed = await confirmAction({
      title: "Desactivar usuario",
      text: `Vas a desactivar a ${user.nombres} ${user.apellidos} (${user.email}). Esta acción no se puede deshacer.`,
      confirmButtonText: "Desactivar usuario",
    });

    if (!confirmed) return;

    showLoading("Desactivando usuario...");
    const result = await desactivateUsuario(user.id);

    if (result.success) {
      closeAlert();
      if (users.length === 1 && page > 0) {
        setPage((current) => current - 1);
      }
      notifySuccess("Usuario desactivado correctamente.");
      await loadTable();
    } else {
      closeAlert();
      notifyError(result.message);
    }
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h3 fw-bold mb-0">
          <i className="fa-solid fa-users me-2 text-primary" />
          Usuarios
        </h1>
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
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="border-0 shadow-sm">
        <div className="table-responsive">
          <Table hover align-middle className="mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Nombre</th>
                <th scope="col">Email</th>
                <th scope="col">Rol</th>
                <th scope="col" className="text-end">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    No hay usuarios registrados.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isSelf = user.email === session?.email;
                  return (
                    <tr key={user.id}>
                      <td className="fw-bold">{user.id}</td>
                      <td>
                        {user.nombres} {user.apellidos}
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <Badge
                          bg={user.rol === "ADMIN" ? "primary" : "secondary"}
                        >
                          {user.rol}
                        </Badge>
                      </td>
                      <td className="text-end text-nowrap">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="me-1"
                          disabled={isSelf}
                          title={
                            isSelf
                              ? "Edita tus datos desde Mi Perfil"
                              : undefined
                          }
                          onClick={() => openEdit(user)}
                        >
                          <i className="fa-solid fa-pen me-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          disabled={isSelf || user.rol === "ADMIN"}
                          title={
                            isSelf || user.rol === "ADMIN"
                              ? "No puedes desactivar una cuenta de administrador"
                              : undefined
                          }
                          onClick={() => handleDelete(user)}
                        >
                          <i className="fa-solid fa-user-slash me-1" />
                          Desactivar
                        </Button>
                      </td>
                    </tr>
                  );
                })
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
        itemLabel="usuarios"
        onPageChange={setPage}
      />

      <Modal
        show={editOpen}
        onHide={editLoading ? () => {} : () => setEditOpen(false)}
        centered
      >
        <Form noValidate onSubmit={handleEditSubmit}>
          <Modal.Header closeButton={!editLoading}>
            <Modal.Title as="h2" className="h5">
              Editar usuario
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editError && <Alert variant="danger">{editError}</Alert>}

            <Form.Group className="mb-3" controlId="edit-nombres">
              <Form.Label>Nombres</Form.Label>
              <Form.Control
                type="text"
                name="nombres"
                value={editForm.nombres}
                onChange={handleEditChange}
                isInvalid={Boolean(editErrors.nombres)}
                required
              />
              {editErrors.nombres && (
                <div className="invalid-feedback d-block">
                  {editErrors.nombres}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="edit-apellidos">
              <Form.Label>Apellidos</Form.Label>
              <Form.Control
                type="text"
                name="apellidos"
                value={editForm.apellidos}
                onChange={handleEditChange}
                isInvalid={Boolean(editErrors.apellidos)}
                required
              />
              {editErrors.apellidos && (
                <div className="invalid-feedback d-block">
                  {editErrors.apellidos}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-1" controlId="edit-email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
                isInvalid={Boolean(editErrors.email)}
                required
              />
              {editErrors.email && (
                <div className="invalid-feedback d-block">
                  {editErrors.email}
                </div>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setEditOpen(false)}
              disabled={editLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={editLoading}>
              {editLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Guardando...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk me-1" />
                  Guardar cambios
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
