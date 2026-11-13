import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { listFunciones } from "../services/funcionesService";
import { listPeliculas } from "../services/peliculasService";
import { normalizeList } from "../utils/format";

export default function CarteleraPage() {
  const [movies, setMovies] = useState([]);
  const [funciones, setFunciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [moviesResponse, funcionesResponse] = await Promise.all([
          listPeliculas({ page: 0, size: 100, sort: "titulo,asc" }),
          listFunciones({ page: 0, size: 200, sort: "id,asc" }).catch(
            () => null,
          ),
        ]);

        if (!active) return;

        setMovies(
          normalizeList(moviesResponse.data).filter(
            (movie) => movie.isActivo !== false,
          ),
        );
        setFunciones(
          funcionesResponse ? normalizeList(funcionesResponse.data) : [],
        );
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const funcionesPorPelicula = useMemo(() => {
    const now = Date.now();
    const counts = new Map();

    for (const funcion of funciones) {
      if (funcion.isActivo === false) continue;
      if (new Date(funcion.fechaHoraFin).getTime() <= now) continue;

      const id = Number(funcion.idPelicula);
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }

    return counts;
  }, [funciones]);

  const filteredMovies = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return movies;

    return movies.filter((movie) =>
      `${movie.titulo} ${movie.genero}`.toLowerCase().includes(term),
    );
  }, [movies, query]);

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">
            <i className="fa-solid fa-film me-2 text-primary" />
            Cartelera
          </h1>
          <p className="text-muted mb-0">
            Elige tu película, la función y tus sillas.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button as={Link} to="/mis-compras" variant="outline-primary">
            <i className="fa-solid fa-ticket me-1" />
            Mis compras
          </Button>
        </div>
      </div>

      <Form.Group className="mb-4" controlId="buscar-pelicula">
        <Form.Control
          type="search"
          placeholder="Buscar por título o género..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </Form.Group>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center text-muted py-5">
          <Spinner animation="border" role="status" className="me-2" />
          Cargando cartelera...
        </div>
      ) : filteredMovies.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center text-muted py-5">
            <i className="fa-solid fa-clapperboard fs-1 d-block mb-3" />
            {movies.length === 0
              ? "No hay películas disponibles en cartelera."
              : "No se encontraron películas con ese filtro."}
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {filteredMovies.map((movie) => {
            const totalFunciones = funcionesPorPelicula.get(movie.id) ?? 0;

            return (
              <Col md={6} lg={4} key={movie.id}>
                <Card className="cf-card cf-movie-card h-100">
                  <div className="cf-poster">
                    <i className="fa-solid fa-clapperboard" />
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <h2 className="h5 fw-bold mb-2">{movie.titulo}</h2>
                    <div className="mb-2">
                      {movie.genero && (
                        <Badge bg="secondary" className="me-1">
                          {movie.genero}
                        </Badge>
                      )}
                      <Badge bg="light" text="dark">
                        {movie.duracionMinutos} min
                      </Badge>
                    </div>
                    <p className="text-muted small cf-clamp-3 mb-3">
                      {movie.sinopsis || "Sin sinopsis disponible."}
                    </p>
                    <div className="mt-auto d-flex justify-content-between align-items-center gap-2">
                      <small className="text-muted">
                        {totalFunciones > 0
                          ? `${totalFunciones} ${
                              totalFunciones === 1
                                ? "función disponible"
                                : "funciones disponibles"
                            }`
                          : "Sin funciones próximas"}
                      </small>
                      <Button
                        as={Link}
                        to={`/comprar/${movie.id}`}
                        size="sm"
                        disabled={totalFunciones === 0}
                      >
                        <i className="fa-solid fa-ticket me-1" />
                        Comprar
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </>
  );
}
