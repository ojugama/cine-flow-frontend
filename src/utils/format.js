export function normalizeList(data) {
  return Array.isArray(data) ? data : (data?.content ?? []);
}

export function formatDateTime(value) {
  return value
    ? new Date(value).toLocaleString("es-CO", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "—";
}

export function toLocalInput(value) {
  return value ? value.slice(0, 16) : "";
}
