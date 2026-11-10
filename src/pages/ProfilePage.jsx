import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import { useAuth } from "../auth/AuthContext";
import {
  closeAlert,
  confirmAction,
  notifyError,
  notifySuccess,
  showLoading,
} from "../utils/alerts";
import {
  deleteMyProfile,
  getMyProfile,
  updateMyPassword,
  updateMyProfile,
} from "../services/usuariosService";

const emptyPasswords = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ProfilePage() {
  const { logout, refreshSession } = useAuth();

  const [profile, setProfile] = useState({
    nombres: "",
    apellidos: "",
    email: "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileAlert, setProfileAlert] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [passwords, setPasswords] = useState(emptyPasswords);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordAlert, setPasswordAlert] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    let active = true;

    getMyProfile().then((result) => {
      if (!active) return;
      setLoadingProfile(false);

      if (result.success) {
        setProfile({
          nombres: result.data.nombres ?? "",
          apellidos: result.data.apellidos ?? "",
          email: result.data.email ?? "",
        });
      } else {
        setProfileAlert(
          result.message || "Ha ocurrido un error al cargar el perfil.",
        );
      }
    });

    return () => {
      active = false;
    };
  }, []);

  function handleProfileChange(event) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setProfileAlert("");
    setProfileErrors({});
    setProfileLoading(true);

    const result = await updateMyProfile({
      nombres: profile.nombres.trim(),
      apellidos: profile.apellidos.trim(),
      email: profile.email.trim(),
    });

    setProfileLoading(false);

    if (result.success) {
      refreshSession(result.data?.token);
      notifySuccess("Datos actualizados correctamente.");
    } else if (result.errors && typeof result.errors === "object") {
      setProfileErrors(result.errors);
    } else {
      setProfileAlert(result.message);
    }
  }

  function handlePasswordChange(event) {
    const { name, value } = event.target;
    setPasswords((current) => ({ ...current, [name]: value }));
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordAlert("");
    setPasswordErrors({});

    if (!passwords.newPassword) {
      setPasswordErrors({ newPassword: "La contraseña nueva es obligatoria." });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordErrors({
        confirmPassword: "Las contraseñas nuevas no coinciden.",
      });
      return;
    }

    setPasswordLoading(true);

    const result = await updateMyPassword({
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    });

    setPasswordLoading(false);

    if (result.success) {
      setPasswords(emptyPasswords);
      notifySuccess("Contraseña actualizada correctamente.");
    } else if (result.errors && typeof result.errors === "object") {
      setPasswordErrors(result.errors);
    } else {
      setPasswordAlert(result.message);
    }
  }

  async function handleDeleteAccount() {
    const confirmed = await confirmAction({
      title: "Eliminar mi cuenta",
      text: "¿Estás seguro de que deseas eliminar tu cuenta? Se cerrará tu sesión actual y esta acción no se puede deshacer.",
      confirmButtonText: "Eliminar cuenta",
    });

    if (!confirmed) return;

    showLoading("Eliminando cuenta...");
    const result = await deleteMyProfile();

    if (result.success) {
      closeAlert();
      notifySuccess("Cuenta eliminada correctamente.");
      logout();
    } else {
      closeAlert();
      notifyError(result.message || "Hubo un error al eliminar tu cuenta.");
    }
  }

  return (
    <>
      <h1 className="h3 fw-bold mb-4">
        <i className="fa-solid fa-user me-2 text-primary" />
        Mi perfil
      </h1>

      <Row className="g-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4">
              <h2 className="h5 fw-bold mb-3">Datos personales</h2>

              {profileAlert && <Alert variant="danger">{profileAlert}</Alert>}

              <Form noValidate onSubmit={handleProfileSubmit}>
                <Form.Group className="mb-3" controlId="nombres">
                  <Form.Label>Nombres</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombres"
                    value={profile.nombres}
                    onChange={handleProfileChange}
                    isInvalid={Boolean(profileErrors.nombres)}
                    disabled={loadingProfile}
                    required
                  />
                  {profileErrors.nombres && (
                    <div className="invalid-feedback d-block">
                      {profileErrors.nombres}
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="apellidos">
                  <Form.Label>Apellidos</Form.Label>
                  <Form.Control
                    type="text"
                    name="apellidos"
                    value={profile.apellidos}
                    onChange={handleProfileChange}
                    isInvalid={Boolean(profileErrors.apellidos)}
                    disabled={loadingProfile}
                    required
                  />
                  {profileErrors.apellidos && (
                    <div className="invalid-feedback d-block">
                      {profileErrors.apellidos}
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    isInvalid={Boolean(profileErrors.email)}
                    disabled={loadingProfile}
                    required
                  />
                  {profileErrors.email && (
                    <div className="invalid-feedback d-block">
                      {profileErrors.email}
                    </div>
                  )}
                </Form.Group>

                <Button type="submit" disabled={profileLoading || loadingProfile}>
                  {profileLoading ? (
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
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4">
              <h2 className="h5 fw-bold mb-3">Cambiar contraseña</h2>

              {passwordAlert && <Alert variant="danger">{passwordAlert}</Alert>}

              <Form noValidate onSubmit={handlePasswordSubmit}>
                <Form.Group className="mb-3" controlId="currentPassword">
                  <Form.Label>Contraseña actual</Form.Label>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    autoComplete="current-password"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    isInvalid={Boolean(passwordErrors.currentPassword)}
                    required
                  />
                  {passwordErrors.currentPassword && (
                    <div className="invalid-feedback d-block">
                      {passwordErrors.currentPassword}
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="newPassword">
                  <Form.Label>Contraseña nueva</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    autoComplete="new-password"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    isInvalid={Boolean(passwordErrors.newPassword)}
                    required
                  />
                  {passwordErrors.newPassword && (
                    <div className="invalid-feedback d-block">
                      {passwordErrors.newPassword}
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="confirmPassword">
                  <Form.Label>Confirmar contraseña nueva</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    isInvalid={Boolean(passwordErrors.confirmPassword)}
                    required
                  />
                  {passwordErrors.confirmPassword && (
                    <div className="invalid-feedback d-block">
                      {passwordErrors.confirmPassword}
                    </div>
                  )}
                </Form.Group>

                <Button type="submit" disabled={passwordLoading}>
                  {passwordLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        className="me-2"
                      />
                      Actualizando contraseña...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-key me-1" />
                      Cambiar contraseña
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12}>
          <Card className="border-0 shadow-sm border-danger">
            <Card.Body className="p-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <h2 className="h5 fw-bold text-danger mb-1">Zona de peligro</h2>
                <p className="text-muted mb-0">
                  Al eliminar tu cuenta, se desactivará tu acceso al sistema y
                  se cerrará tu sesión actual.
                </p>
              </div>
              <Button variant="outline-danger" onClick={handleDeleteAccount}>
                <i className="fa-solid fa-trash me-1" />
                Eliminar mi cuenta
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
