import axios from "axios";
import { clearSession, getToken } from "../auth/session";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token && !config.skipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(
        new ApiError(
          "No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.",
        ),
      );
    }

    const { status, data } = error.response;
    const rejectSession =
      getToken() &&
      !error.config?.skipAuth &&
      (status === 401 || (status === 403 && !data));

    if (rejectSession) {
      clearSession();
      window.dispatchEvent(new Event("cineflow:unauthorized"));
    }

    return Promise.reject(
      new ApiError(
        data?.message || "Ha ocurrido un error inesperado.",
        status,
        data?.data ?? null,
      ),
    );
  },
);

async function unwrap(promise) {
  const response = await promise;
  return response.data;
}

export const api = {
  get: (url, config) => unwrap(http.get(url, config)),
  post: (url, body, config) => unwrap(http.post(url, body, config)),
  put: (url, body, config) => unwrap(http.put(url, body, config)),
  patch: (url, body, config) => unwrap(http.patch(url, body, config)),
  delete: (url, config) => unwrap(http.delete(url, config)),
};
