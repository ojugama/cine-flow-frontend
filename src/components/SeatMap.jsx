import { getRoomLayout } from "../data/seats";

export default function SeatMap({
  funcion,
  selectedSeats,
  reservedSeats,
  onToggle,
}) {
  const { rows, cols, rowLabels } = getRoomLayout(funcion);
  const reserved = new Set(reservedSeats);
  const selected = new Set(selectedSeats);

  return (
    <div className="cf-seatmap">
      <div className="cf-screen">Pantalla</div>

      {Array.from({ length: rows }).map((_, rowIndex) => {
        const rowLabel = rowLabels[rowIndex];

        return (
          <div className="cf-seat-row" key={rowLabel}>
            <span className="cf-seat-label">{rowLabel}</span>
            {Array.from({ length: cols }).map((__, colIndex) => {
              const seat = `${rowLabel}${colIndex + 1}`;
              const isReserved = reserved.has(seat);
              const isSelected = selected.has(seat);

              return (
                <button
                  type="button"
                  key={seat}
                  className={`cf-seat${isSelected ? " is-selected" : ""}${
                    isReserved ? " is-reserved" : ""
                  }`}
                  disabled={isReserved}
                  aria-label={`Silla ${seat}${
                    isReserved ? " ocupada" : ""
                  }`}
                  aria-pressed={isSelected}
                  onClick={() => onToggle(seat)}
                >
                  {colIndex + 1}
                </button>
              );
            })}
            <span className="cf-seat-label">{rowLabel}</span>
          </div>
        );
      })}

      <div className="cf-seat-legend">
        <span>
          <i className="cf-seat-swatch" /> Disponible
        </span>
        <span>
          <i className="cf-seat-swatch is-selected" /> Seleccionada
        </span>
        <span>
          <i className="cf-seat-swatch is-reserved" /> Ocupada
        </span>
      </div>
    </div>
  );
}
