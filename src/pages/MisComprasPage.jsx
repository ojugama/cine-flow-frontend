import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { listMyCompras } from "../services/comprasService";
import {
  formatCurrency,
  formatDateTime,
  normalizeList,
} from "../utils/format";

export default function MisComprasPage() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const response = await listMyCompras();
        if (!active) return;
        setPurchases(normalizeList(response.data));
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

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">
            <i className="fa-solid fa-ticket me-2 text-primary" />
            Mis compras
          </h1>
          <p className="text-muted mb-0">
            Consulta las boletas y combos que has comprado.
          </p>
        </div>
        <Button as={Link} to="/cartelera" variant="outline-primary">
          <i className="fa-solid fa-film me-1" />
          Ir a la cartelera
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center text-muted py-5">
          <Spinner animation="border" role="status" className="me-2" />
          Cargando compras...
        </div>
      ) : purchases.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <i className="fa-solid fa-ticket-simple fs-1 text-muted d-block mb-3" />
            <h2 className="h5 fw-bold">Aún no tienes compras</h2>
            <p className="text-muted mb-3">
              Elige una película, selecciona tus sillas y agrega tus combos
              favoritos.
            </p>
            <Button as={Link} to="/cartelera">
              <i className="fa-solid fa-film me-1" />
              Ver cartelera
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {purchases.map((purchase) => {
            const seats = purchase.sillas ?? purchase.seats ?? [];
            const ticketPrice =
              purchase.precioBoleta ?? purchase.ticketPrice ?? 0;
            const boletasTotal = seats.length * ticketPrice;
            const codigo = purchase.codigo ?? purchase.id;
            const tituloPelicula =
              purchase.tituloPelicula ??
              purchase.pelicula?.titulo ??
              "Película";
            const fechaInicioFuncion =
              purchase.fechaHoraInicioFuncion ??
              purchase.funcion?.fechaHoraInicio;
            const formatoSala =
              purchase.formatoSala ?? purchase.funcion?.formatoSala;
            const nombreSucursal =
              purchase.nombreSucursal ??
              purchase.funcion?.nombreSucursal ??
              "Sucursal";
            const ciudadSucursal =
              purchase.ciudadSucursal ?? purchase.funcion?.ciudadSucursal;
            const nombreSala =
              purchase.nombreSala ?? purchase.funcion?.nombreSala ?? "Sala";
            const fechaCompra = purchase.fechaCompra ?? purchase.createdAt;

            return (
              <Col xl={6} key={purchase.id ?? codigo}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Header className="bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <span className="fw-bold">
                      <i className="fa-solid fa-barcode me-1 text-primary" />
                      {codigo}
                    </span>
                    <div className="d-flex align-items-center gap-2">
                      {typeof purchase.isVigente === "boolean" && (
                        <Badge
                          bg={purchase.isVigente ? "info" : "secondary"}
                        >
                          {purchase.isVigente ? "Vigente" : "Finalizada"}
                        </Badge>
                      )}
                      <Badge bg="success">
                        {formatCurrency(purchase.total)}
                      </Badge>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <div>
                        <h2 className="h5 fw-bold mb-1">{tituloPelicula}</h2>
                        <div className="text-muted small">
                          <i className="fa-solid fa-calendar-days me-1" />
                          {formatDateTime(fechaInicioFuncion)}
                        </div>
                      </div>
                      {formatoSala && (
                        <Badge bg="secondary">{formatoSala}</Badge>
                      )}
                    </div>

                    <div className="text-muted small mb-3">
                      <i className="fa-solid fa-location-dot me-1" />
                      {nombreSucursal}
                      {ciudadSucursal ? ` (${ciudadSucursal})` : ""}
                      {" · "}
                      {nombreSala}
                    </div>

                    <div className="mb-3">
                      <div className="small text-muted mb-1">
                        Boletas ({seats.length})
                      </div>
                      <div className="d-flex flex-wrap gap-1">
                        {seats.map((seat) => (
                          <Badge key={seat} bg="primary">
                            {seat}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {purchase.combos?.length > 0 && (
                      <Table size="sm" borderless className="mb-0">
                        <tbody>
                          {purchase.combos.map((combo) => (
                            <tr
                              key={
                                combo.idCombo ?? combo.id ?? combo.nombre
                              }
                            >
                              <td className="text-muted ps-0">
                                {combo.cantidad} × {combo.nombre}
                              </td>
                              <td className="text-end pe-0">
                                {formatCurrency(
                                  combo.precio * combo.cantidad,
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Card.Body>
                  <Card.Footer className="bg-white small text-muted d-flex flex-wrap justify-content-between gap-2">
                    <span>
                      <i className="fa-solid fa-clock me-1" />
                      Compra: {formatDateTime(fechaCompra)}
                    </span>
                    <span>Boletas: {formatCurrency(boletasTotal)}</span>
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </>
  );
}
