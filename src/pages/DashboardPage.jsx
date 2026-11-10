import { useEffect, useState } from "react";
import { Alert, Card, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getMyProfile } from "../services/usuariosService";

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getMyProfile().then((result) => {
      if (!active) return;
      if (result.success) {
        setProfile(result.data);
      } else {
        setError(result.message);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const cards = [
    {
      to: "/perfil",
      icon: "fa-user",
      title: "Mi perfil",
      text: "Edita tus datos personales o cambia tu contraseña.",
    },
  ];

  if (isAdmin) {
    cards.push(
      {
        to: "/admin/peliculas",
        icon: "fa-clapperboard",
        title: "Películas",
        text: "Administra el catálogo de películas en cartelera.",
      },
      {
        to: "/admin/funciones",
        icon: "fa-calendar-days",
        title: "Funciones",
        text: "Programa, consulta, edita y elimina funciones de películas.",
      },
      {
        to: "/admin/usuarios",
        icon: "fa-users",
        title: "Usuarios",
        text: "Consulta, edita y desactiva las cuentas registradas.",
      },
    );
  }

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}

      <h1 className="h3 fw-bold mb-1">
        Hola{profile?.nombres ? `, ${profile.nombres}` : ""}
      </h1>
      <p className="text-muted mb-4">
        {profile?.rol === "ADMIN"
          ? "Tienes acceso de administrador."
          : "Qué bueno verte de nuevo."}
      </p>

      <Row className="g-3">
        {cards.map((card) => (
          <Col md={6} lg={4} key={card.to}>
            <Card
              as={Link}
              to={card.to}
              className="cf-card h-100 text-decoration-none text-body"
            >
              <Card.Body>
                <h2 className="h5 fw-bold text-primary">
                  <i className={`fa-solid ${card.icon} me-2`} />
                  {card.title}
                </h2>
                <p className="mb-0 text-muted">{card.text}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}
