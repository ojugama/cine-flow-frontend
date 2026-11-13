const ROW_LABELS = "ABCDEFGHIJ".split("");

const PRECIOS_POR_FORMATO = {
  "2D": 15000,
  "3D": 18000,
  IMAX: 23000,
  VIP: 28000,
  "4DX": 26000,
  XD: 21000,
};

export function getRowLabels(rows) {
  return ROW_LABELS.slice(0, rows);
}

export function getRoomLayout(funcion) {
  const seed = Number(funcion?.idSala) || 1;
  const rows = 7 + (seed % 3);
  const cols = 9 + (seed % 3);
  return { rows, cols, rowLabels: getRowLabels(rows) };
}

export function getTicketPrice(funcion) {
  const formato = (funcion?.formatoSala ?? "").toUpperCase();
  return PRECIOS_POR_FORMATO[formato] ?? 16000;
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 1000003;
  }
  return hash;
}

export function getPreSoldSeats(funcion) {
  const { rows, rowLabels, cols } = getRoomLayout(funcion);
  const seats = new Set();
  const funcionKey = funcion?.id ?? "0";

  for (let row = 0; row < rows; row += 1) {
    for (let col = 1; col <= cols; col += 1) {
      const label = `${rowLabels[row]}${col}`;
      if (hashString(`${funcionKey}:${label}`) % 8 === 0) {
        seats.add(label);
      }
    }
  }

  return [...seats];
}
