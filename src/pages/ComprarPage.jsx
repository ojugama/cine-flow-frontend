import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Row,
  Spinner,
} from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import SeatMap from "../components/SeatMap";
import { getTicketPrice } from "../data/seats";
import { listCombos } from "../services/combosService";
import { createCompra, getSillasOcupadas } from "../services/comprasService";
import { listFuncionesByPelicula } from "../services/funcionesService";
import { getPeliculaById } from "../services/peliculasService";
import {
  confirmAction,
  notifyError,
  notifyInfo,
  notifySuccess,
} from "../utils/alerts";
import {
  formatCurrency,
  formatDateTime,
  formatLongDate,
  formatTime,
  normalizeList,
} from "../utils/format";

const MAX_TICKETS = 10;

function sortSeats(a, b) {
  if (a[0] !== b[0]) return a[0].localeCompare(b[0]);
  return Number(a.slice(1)) - Number(b.slice(1));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[character];
  });
}

function groupByDate(funciones) {
  const groups = new Map();

  for (const funcion of funciones) {
    const date = new Date(funcion.fechaHoraInicio);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    if (!groups.has(key)) {
      groups.set(key, {
        label: formatLongDate(funcion.fechaHoraInicio),
        items: [],
      });
    }

    groups.get(key).items.push(funcion);
  }

  return [...groups.values()];
}

export default function ComprarPage() {
  const { idPelicula } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [funciones, setFunciones] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedFuncionId, setSelectedFuncionId] = useState(null);
  const [reservedSeats, setReservedSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [seatsError, setSeatsError] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [cantidades, setCantidades] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [movieResponse, funcionesResponse, combosResponse] =
          await Promise.all([
            getPeliculaById(idPelicula),
            listFuncionesByPelicula(idPelicula),
            listCombos(),
          ]);

        if (!active) return;

        setMovie(movieResponse.data);

        const now = Date.now();
        const disponibles = normalizeList(funcionesResponse.data)
          .filter(
            (funcion) =>
              funcion.isActivo !== false &&
              new Date(funcion.fechaHoraFin).getTime() > now,
          )
          .sort(
            (a, b) =>
              new Date(a.fechaHoraInicio) - new Date(b.fechaHoraInicio),
          );

        setFunciones(disponibles);
        setCombos(
          normalizeList(combosResponse.data).filter(
            (combo) => combo.isActivo !== false,
          ),
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
  }, [idPelicula]);

  const loadSillasOcupadas = useCallback(async (idFuncion) => {
    if (!idFuncion) {
      setReservedSeats([]);
      setSeatsError("");
      return;
    }

    setLoadingSeats(true);
    setSeatsError("");

    try {
      const response = await getSillasOcupadas(idFuncion);
      const ocupadas = normalizeList(response.data);
      setReservedSeats(ocupadas);
      setSelectedSeats((current) =>
        current.filter((seat) => !ocupadas.includes(seat)),
      );
    } catch (requestError) {
      setReservedSeats([]);
      setSeatsError(requestError.message);
    } finally {
      setLoadingSeats(false);
    }
  }, []);

  useEffect(() => {
    loadSillasOcupadas(selectedFuncionId);
  }, [selectedFuncionId, loadSillasOcupadas]);

  const selectedFuncion = useMemo(
    () =>
      funciones.find((funcion) => funcion.id === Number(selectedFuncionId)) ??
      null,
    [funciones, selectedFuncionId],
  );

  const grupos = useMemo(() => groupByDate(funciones), [funciones]);

  const ticketPrice = selectedFuncion ? getTicketPrice(selectedFuncion) : 0;

  const combosSeleccionados = useMemo(
    () =>
      combos
        .map((combo) => ({
          ...combo,
          cantidad: cantidades[combo.id] ?? 0,
        }))
        .filter((combo) => combo.cantidad > 0),
    [combos, cantidades],
  );

  const boletasTotal = selectedSeats.length * ticketPrice;
  const combosTotal = combosSeleccionados.reduce(
    (total, combo) => total + combo.precio * combo.cantidad,
    0,
  );
  const total = boletasTotal + combosTotal;

  function handleSelectFuncion(funcion) {
    setSelectedFuncionId(funcion.id);
    setSelectedSeats([]);
  }

  function toggleSeat(seat) {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats((current) =>
        current.filter((item) => item !== seat),
      );
      return;
    }

    if (selectedSeats.length >= MAX_TICKETS) {
      notifyInfo(`Puedes comprar máximo ${MAX_TICKETS} boletas por compra.`);
      return;
    }

    setSelectedSeats((current) => [...current, seat].sort(sortSeats));
  }

  function changeCombo(comboId, delta) {
    setCantidades((current) => ({
      ...current,
      [comboId]: Math.max(0, (current[comboId] ?? 0) + delta),
    }));
  }

  async function handleCheckout() {
    if (!selectedFuncion) {
      notifyInfo("Primero selecciona una función.");
      return;
    }

    if (selectedSeats.length === 0) {
      notifyInfo("Selecciona al menos una silla.");
      return;
    }

    const combinados = combosSeleccionados
      .map(
        (combo) =>
          `${combo.cantidad} × ${escapeHtml(combo.nombre)} (${formatCurrency(
            combo.precio * combo.cantidad,
          )})`,
      )
      .join("<br/>");

    const resumen = [
      `<strong>${escapeHtml(movie?.titulo ?? "Película")}</strong>`,
      `${escapeHtml(formatDateTime(selectedFuncion.fechaHoraInicio))}`,
      `${escapeHtml(selectedFuncion.nombreSucursal ?? "Sucursal")}${
        selectedFuncion.ciudadSucursal
          ? ` (${escapeHtml(selectedFuncion.ciudadSucursal)})`
          : ""
      } · ${escapeHtml(selectedFuncion.nombreSala ?? "Sala")}`,
      `Sillas: <strong>${escapeHtml(selectedSeats.join(", "))}</strong>`,
      combinados ? `<br/>${combinados}` : "",
      `<hr/><strong>Total: ${formatCurrency(total)}</strong>`,
    ].join("<br/>");

    const confirmed = await confirmAction({
      title: "Confirmar compra",
      html: resumen,
      icon: "question",
      confirmButtonText: "Confirmar compra",
    });

    if (!confirmed) return;

    setSaving(true);

    try {
      const payload = {
        idFuncion: selectedFuncion.id,
        sillas: selectedSeats,
        combos: combosSeleccionados.map((combo) => ({
          idCombo: combo.id,
          cantidad: combo.cantidad,
        })),
      };

      const response = await createCompra(payload);
      const compra = response.data;

      notifySuccess(
        compra?.codigo
          ? `Compra registrada. Código ${compra.codigo}`
          : (response.message || "Compra registrada correctamente."),
      );
      navigate("/mis-compras");
    } catch (requestError) {
      notifyError(requestError.message);
      await loadSillasOcupadas(selectedFuncion.id);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <Link
            to="/cartelera"
            className="text-decoration-none small fw-semibold"
          >
            <i className="fa-solid fa-arrow-left me-1" />
            Volver a la cartelera
          </Link>
          <h1 className="h3 fw-bold mb-1 mt-2">
            {movie?.titulo ?? "Comprar boletas"}
          </h1>
          <p className="text-muted mb-0">
            {movie?.genero ? `${movie.genero} · ` : ""}
            {movie?.duracionMinutos ? `${movie.duracionMinutos} min` : ""}
          </p>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center text-muted py-5">
          <Spinner animation="border" role="status" className="me-2" />
          Cargando funciones...
        </div>
      ) : funciones.length === 0 ? (
        <Alert variant="info">
          Esta película no tiene funciones disponibles por el momento.{" "}
          <Link to="/cartelera">Ver otras películas</Link>.
        </Alert>
      ) : (
        <Row className="g-4">
          <Col lg={8}>
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h2 className="h5 fw-bold mb-3">
                  <span className="cf-step">1</span>
                  Elige la función
                </h2>

                {grupos.map((grupo) => (
                  <div className="mb-3" key={grupo.label}>
                    <div className="text-muted small fw-semibold mb-2">
                      {grupo.label}
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {grupo.items.map((funcion) => {
                        const isActive = funcion.id === selectedFuncion?.id;

                        return (
                          <Button
                            key={funcion.id}
                            type="button"
                            variant={isActive ? "primary" : "outline-primary"}
                            className="text-start"
                            onClick={() => handleSelectFuncion(funcion)}
                          >
                            <span className="fw-bold d-block">
                              {formatTime(funcion.fechaHoraInicio)}
                            </span>
                            <small>
                              {funcion.nombreSala ?? "Sala"}
                              {funcion.formatoSala
                                ? ` · ${funcion.formatoSala}`
                                : ""}
                            </small>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h2 className="h5 fw-bold mb-3">
                  <span className="cf-step">2</span>
                  Elige tus sillas
                </h2>

                {!selectedFuncion ? (
                  <p className="text-muted mb-0">
                    Selecciona una función para ver el mapa de sillas.
                  </p>
                ) : (
                  <>
                    <div className="d-flex flex-wrap gap-3 mb-3 small text-muted">
                      <span>
                        <i className="fa-solid fa-location-dot me-1" />
                        {selectedFuncion.nombreSucursal ?? "Sucursal"}
                        {selectedFuncion.ciudadSucursal
                          ? ` (${selectedFuncion.ciudadSucursal})`
                          : ""}
                      </span>
                      <span>
                        <i className="fa-solid fa-couch me-1" />
                        {selectedFuncion.nombreSala ?? "Sala"}
                      </span>
                      <span>
                        <i className="fa-solid fa-tag me-1" />
                        {formatCurrency(ticketPrice)} por boleta
                      </span>
                    </div>

                    {seatsError && (
                      <Alert variant="danger" className="mb-3">
                        {seatsError}
                      </Alert>
                    )}

                    {loadingSeats ? (
                      <div className="text-center text-muted py-4">
                        <Spinner
                          animation="border"
                          size="sm"
                          role="status"
                          className="me-2"
                        />
                        Consultando disponibilidad de sillas...
                      </div>
                    ) : (
                      <>
                        <SeatMap
                          funcion={selectedFuncion}
                          selectedSeats={selectedSeats}
                          reservedSeats={reservedSeats}
                          onToggle={toggleSeat}
                        />

                        <div className="mt-3">
                          {selectedSeats.length === 0 ? (
                            <span className="text-muted small">
                              Aún no has seleccionado sillas. Máximo{" "}
                              {MAX_TICKETS} por compra.
                            </span>
                          ) : (
                            <div className="d-flex flex-wrap align-items-center gap-2">
                              <span className="small text-muted">
                                Sillas seleccionadas:
                              </span>
                              {selectedSeats.map((seat) => (
                                <Badge key={seat} bg="primary">
                                  {seat}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h2 className="h5 fw-bold mb-3">
                  <span className="cf-step">3</span>
                  Agrega combos de comida
                </h2>

                {combos.length === 0 ? (
                  <p className="text-muted mb-0">
                    No hay combos disponibles en este momento.
                  </p>
                ) : (
                  <Row className="g-3">
                    {combos.map((combo) => {
                      const cantidad = cantidades[combo.id] ?? 0;

                      return (
                        <Col md={6} key={combo.id}>
                          <div className="cf-combo h-100">
                            <div className="cf-combo-icon">
                              <i
                                className={`fa-solid ${
                                  combo.icono || "fa-utensils"
                                }`}
                              />
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start gap-2">
                                <div>
                                  <div className="fw-semibold">
                                    {combo.nombre}
                                  </div>
                                  <div className="text-muted small">
                                    {combo.descripcion}
                                  </div>
                                </div>
                                <span className="fw-bold text-nowrap">
                                  {formatCurrency(combo.precio)}
                                </span>
                              </div>
                              <div className="d-flex align-items-center gap-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="outline-secondary"
                                  disabled={cantidad === 0}
                                  onClick={() => changeCombo(combo.id, -1)}
                                  aria-label={`Quitar ${combo.nombre}`}
                                >
                                  <i className="fa-solid fa-minus" />
                                </Button>
                                <span
                                  className="fw-bold"
                                  style={{ width: 24 }}
                                >
                                  {cantidad}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={() => changeCombo(combo.id, 1)}
                                  aria-label={`Agregar ${combo.nombre}`}
                                >
                                  <i className="fa-solid fa-plus" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="border-0 shadow-sm cf-summary">
              <Card.Body>
                <h2 className="h5 fw-bold mb-3">Resumen de compra</h2>

                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">Película</span>
                  <span className="fw-semibold text-end">
                    {movie?.titulo ?? "—"}
                  </span>
                </div>

                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">Función</span>
                  <span className="fw-semibold text-end">
                    {selectedFuncion
                      ? formatDateTime(selectedFuncion.fechaHoraInicio)
                      : "Sin seleccionar"}
                  </span>
                </div>

                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">Sala</span>
                  <span className="fw-semibold text-end">
                    {selectedFuncion
                      ? `${selectedFuncion.nombreSala ?? "Sala"}${
                          selectedFuncion.formatoSala
                            ? ` · ${selectedFuncion.formatoSala}`
                            : ""
                        }`
                      : "—"}
                  </span>
                </div>

                <hr />

                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">
                    Boletas ({selectedSeats.length})
                  </span>
                  <span className="fw-semibold">
                    {selectedSeats.length > 0
                      ? selectedSeats.join(", ")
                      : "Sin sillas"}
                  </span>
                </div>

                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">Subtotal boletas</span>
                  <span>{formatCurrency(boletasTotal)}</span>
                </div>

                {combosSeleccionados.length > 0 && (
                  <>
                    <hr />
                    {combosSeleccionados.map((combo) => (
                      <div
                        className="d-flex justify-content-between small mb-1"
                        key={combo.id}
                      >
                        <span className="text-muted">
                          {combo.cantidad} × {combo.nombre}
                        </span>
                        <span>
                          {formatCurrency(combo.precio * combo.cantidad)}
                        </span>
                      </div>
                    ))}
                    <div className="d-flex justify-content-between small mb-2 mt-2">
                      <span className="text-muted">Subtotal combos</span>
                      <span>{formatCurrency(combosTotal)}</span>
                    </div>
                  </>
                )}

                <hr />

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-semibold">Total</span>
                  <span className="h4 fw-bold text-primary mb-0">
                    {formatCurrency(total)}
                  </span>
                </div>

                <Button
                  className="w-100"
                  size="lg"
                  disabled={saving || loadingSeats || selectedSeats.length === 0}
                  onClick={handleCheckout}
                >
                  {saving ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        className="me-2"
                      />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-credit-card me-1" />
                      Confirmar compra
                    </>
                  )}
                </Button>

                <p className="text-muted small text-center mt-2 mb-0">
                  Recibirás un código de compra al confirmar.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
}
