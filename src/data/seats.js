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
