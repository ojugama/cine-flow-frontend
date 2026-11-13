import { useEffect, useState } from "react";
import { Badge, Button, Card, Col, Row, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getPurchasesByUser } from "../data/purchases";
import { formatCurrency, formatDateTime } from "../utils/format";

export default function MisComprasPage() {
  const { session } = useAuth();
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    setPurchases(getPurchasesByUser(session?.email));
  }, [session?.email]);

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

      {purchases.length === 0 ? (
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
            const boletasTotal =
              (purchase.seats?.length ?? 0) * (purchase.ticketPrice ?? 0);

            return (
              <Col xl={6} key={purchase.id}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Header className="bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <span className="fw-bold">
                      <i className="fa-solid fa-barcode me-1 text-primary" />
                      {purchase.id}
                    </span>
                    <Badge bg="success">
                      {formatCurrency(purchase.total)}
                    </Badge>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <div>
                        <h2 className="h5 fw-bold mb-1">
                          {purchase.pelicula?.titulo ?? "Película"}
                        </h2>
                        <div className="text-muted small">
                          <i className="fa-solid fa-calendar-days me-1" />
                          {formatDateTime(purchase.funcion?.fechaHoraInicio)}
                        </div>
                      </div>
                      {purchase.funcion?.formatoSala && (
                        <Badge bg="secondary">
                          {purchase.funcion.formatoSala}
                        </Badge>
                      )}
                    </div>

                    <div className="text-muted small mb-3">
                      <i className="fa-solid fa-location-dot me-1" />
                      {purchase.funcion?.nombreSucursal ?? "Sucursal"}
                      {purchase.funcion?.ciudadSucursal
                        ? ` (${purchase.funcion.ciudadSucursal})`
                        : ""}
                      {" · "}
                      {purchase.funcion?.nombreSala ?? "Sala"}
                    </div>

                    <div className="mb-3">
                      <div className="small text-muted mb-1">
                        Boletas ({purchase.seats?.length ?? 0})
                      </div>
                      <div className="d-flex flex-wrap gap-1">
                        {(purchase.seats ?? []).map((seat) => (
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
                            <tr key={combo.id}>
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
                      Compra: {formatDateTime(purchase.createdAt)}
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
