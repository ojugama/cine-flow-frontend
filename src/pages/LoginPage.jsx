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
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await login({
      email: form.email.trim(),
      password: form.password,
    });

    setLoading(false);

    if (result.success) {
      navigate(location.state?.from || "/dashboard", { replace: true });
    } else {
      setError(result.message || "Email o contraseña incorrectos.");
    }
  }

  return (
    <div
      className="bg-light d-flex align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col md={5}>
            <Card className="shadow-sm border-0 rounded-3">
              <Card.Body className="p-5">
                <h2 className="text-center mb-4 fw-bold text-primary">
                  <i className="fa-solid fa-film me-2" />
                  CineFlow
                </h2>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Floating className="mb-3">
                    <Form.Control
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Digite el email"
                      autoComplete="username"
                      required
                      value={form.email}
                      onChange={handleChange}
                    />
                    <label htmlFor="email">Email</label>
                  </Form.Floating>

                  <Form.Floating className="mb-4">
                    <Form.Control
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Digite la contraseña"
                      autoComplete="current-password"
                      required
                      value={form.password}
                      onChange={handleChange}
                    />
                    <label htmlFor="password">Contraseña</label>
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
                        Ingresando...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-right-to-bracket me-1" />
                        Iniciar sesión
                      </>
                    )}
                  </Button>
                </Form>

                <p className="text-center text-muted small mt-4 mb-0">
                  ¿Aún no tienes cuenta? <Link to="/registro">Regístrate</Link>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
