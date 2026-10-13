import { getToken, logout } from "../auth/session.js";

const API_BASE_URL = "http://localhost:8081/api";

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function fetchApi(endpoint, options = {}) {
  const { auth = true, headers = {}, ...fetchOptions } = options;

  const finalHeaders = { ...headers };
  if (fetchOptions.body && !finalHeaders["Content-Type"]) {
    finalHeaders["Content-Type"] = "application/json";
  }

  const token = auth ? getToken() : null;
  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers: finalHeaders,
    });
  } catch (error) {
    console.error(`No se pudo conectar con la API (${endpoint}): `, error);
    throw new ApiError(
      "No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.",
    );
  }

  let json = null;
  try {
    json = await response.json();
  } catch {}

  if (!response.ok) {
    const sessionRejected =
      token && (response.status === 401 || (response.status === 403 && !json));

    if (sessionRejected) {
      logout();
    }

    throw new ApiError(
      json?.message || "Ha ocurrido un error inesperado.",
      response.status,
      json?.data ?? null,
    );
  }

  return json;
}
