import { API_BASE_URL } from "../api/apiClient";

export function normalizeList(data) {
  return Array.isArray(data) ? data : (data?.content ?? []);
}

export function resolveImageUrl(value) {
  if (!value) return "";

  const url = String(value).trim();
  if (!url) return "";
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }

  const origin = new URL(API_BASE_URL, window.location.origin).origin;
  return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
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

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatCurrency(value) {
  return currencyFormatter.format(Number(value) || 0);
}

export function formatLongDate(value) {
  if (!value) return "—";

  const label = new Date(value).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatTime(value) {
  return value
    ? new Date(value).toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
}
