import { Badge, Button, Container, Nav, Navbar } from "react-bootstrap";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Layout() {
  const { session, isAdmin, isClient, logout } = useAuth();

  return (
    <>
      <Navbar
        expand="md"
        variant="dark"
        className="cf-navbar"
        collapseOnSelect
      >
        <Container>
          <Navbar.Brand as={NavLink} to="/dashboard" className="fw-bold">
            <i className="fa-solid fa-film me-2" />
            CineFlow
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-content" />
          <Navbar.Collapse id="navbar-content">
            <Nav className="me-auto mb-2 mb-md-0">
              <Nav.Link as={NavLink} to="/dashboard" end>
                <i className="fa-solid fa-house me-1" />
                Inicio
              </Nav.Link>
              {isClient && (
                <>
                  <Nav.Link as={NavLink} to="/cartelera">
                    <i className="fa-solid fa-film me-1" />
                    Cartelera
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/mis-compras">
                    <i className="fa-solid fa-ticket me-1" />
                    Mis compras
                  </Nav.Link>
                </>
              )}
              <Nav.Link as={NavLink} to="/perfil">
                <i className="fa-solid fa-user me-1" />
                Mi perfil
              </Nav.Link>
              {isAdmin && (
                <>
                  <Nav.Link as={NavLink} to="/admin/usuarios">
                    <i className="fa-solid fa-users me-1" />
                    Usuarios
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/admin/peliculas">
                    <i className="fa-solid fa-clapperboard me-1" />
                    Películas
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/admin/funciones">
                    <i className="fa-solid fa-calendar-days me-1" />
                    Funciones
                  </Nav.Link>
                </>
              )}
            </Nav>
            <span className="navbar-text me-md-3 mb-2 mb-md-0 small">
              <i className="fa-solid fa-envelope me-1" />
              {session?.email}{" "}
              <Badge bg="light" text="dark" className="ms-1">
                {session?.rol}
              </Badge>
            </span>
            <Button variant="outline-light" size="sm" onClick={logout}>
              <i className="fa-solid fa-right-from-bracket me-1" />
              Cerrar sesión
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container as="main" className="py-4">
        <Outlet />
      </Container>
    </>
  );
}
