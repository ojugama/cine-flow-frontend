import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { registerUsuario } from "../services/usuariosService";

const initialForm = {
  nombres: "",
  apellidos: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    if (!form.password) {
      setFieldErrors({ password: "La contraseña es obligatoria." });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setFieldErrors({ confirmPassword: "Las contraseñas no coinciden." });
      return;
    }

    setLoading(true);

    const userData = {
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      email: form.email.trim(),
      password: form.password,
    };

    const result = await registerUsuario(userData);

    if (!result.success) {
      if (result.errors && typeof result.errors === "object") {
        setFieldErrors(result.errors);
      } else {
        setError(result.message);
      }
      setLoading(false);
      return;
    }

    const authResult = await login({
      email: userData.email,
      password: userData.password,
    });

    setLoading(false);

    if (authResult.success) {
      navigate("/dashboard", { replace: true });
    } else {
      setError(authResult.message);
    }
  }

  function fieldProps(name) {
    return {
      name,
      value: form[name],
      onChange: handleChange,
      isInvalid: Boolean(fieldErrors[name]),
    };
  }

  return (
    <div
      className="bg-light d-flex align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-sm border-0 rounded-3">
              <Card.Body className="p-5">
                <h2 className="text-center mb-1 fw-bold text-primary">
                  <i className="fa-solid fa-film me-2" />
                  CineFlow
                </h2>
                <p className="text-center text-muted mb-4">Crea tu cuenta</p>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form noValidate onSubmit={handleSubmit}>
                  <Row className="g-3 mb-3">
                    <Col sm={6}>
                      <Form.Floating>
                        <Form.Control
                          id="nombres"
                          type="text"
                          placeholder="Nombres"
                          autoComplete="given-name"
                          required
                          {...fieldProps("nombres")}
                        />
                        <label htmlFor="nombres">Nombres</label>
                        {fieldErrors.nombres && (
                          <div className="invalid-feedback d-block">
                            {fieldErrors.nombres}
                          </div>
                        )}
                      </Form.Floating>
                    </Col>
                    <Col sm={6}>
                      <Form.Floating>
                        <Form.Control
                          id="apellidos"
                          type="text"
                          placeholder="Apellidos"
                          autoComplete="family-name"
                          required
                          {...fieldProps("apellidos")}
                        />
                        <label htmlFor="apellidos">Apellidos</label>
                        {fieldErrors.apellidos && (
                          <div className="invalid-feedback d-block">
                            {fieldErrors.apellidos}
                          </div>
                        )}
                      </Form.Floating>
                    </Col>
                  </Row>

                  <Form.Floating className="mb-3">
                    <Form.Control
                      id="email"
                      type="email"
                      placeholder="Email"
                      autoComplete="email"
                      required
                      {...fieldProps("email")}
                    />
                    <label htmlFor="email">Email</label>
                    {fieldErrors.email && (
                      <div className="invalid-feedback d-block">
                        {fieldErrors.email}
                      </div>
                    )}
                  </Form.Floating>

                  <Form.Floating className="mb-3">
                    <Form.Control
                      id="password"
                      type="password"
                      placeholder="Contraseña"
                      autoComplete="new-password"
                      required
                      {...fieldProps("password")}
                    />
                    <label htmlFor="password">Contraseña</label>
                    {fieldErrors.password && (
                      <div className="invalid-feedback d-block">
                        {fieldErrors.password}
                      </div>
                    )}
                  </Form.Floating>

                  <Form.Floating className="mb-4">
                    <Form.Control
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirmar contraseña"
                      autoComplete="new-password"
                      required
                      {...fieldProps("confirmPassword")}
                    />
                    <label htmlFor="confirmPassword">
                      Confirmar contraseña
                    </label>
                    {fieldErrors.confirmPassword && (
                      <div className="invalid-feedback d-block">
                        {fieldErrors.confirmPassword}
                      </div>
                    )}
                  </Form.Floating>

                  <Button
                    type="submit"
                    className="w-100 py-2 fw-bold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-user-plus me-1" />
                        Crear cuenta
                      </>
                    )}
                  </Button>
                </Form>

                <p className="text-center text-muted small mt-4 mb-0">
                  ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
