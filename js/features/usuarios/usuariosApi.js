import { fetchApi } from "../../core/api/apiClient.js";

const json = (method, data) => ({ method, body: JSON.stringify(data) });

// Público
export const registerRequest = (data) =>
  fetchApi("/usuarios", { ...json("POST", data), auth: false });

// Usuario autenticado
export const getMeRequest = () => fetchApi("/usuarios/me");
export const updateMeRequest = (data) => fetchApi("/usuarios/me", json("PUT", data));
export const updateMyPasswordRequest = (data) =>
  fetchApi("/usuarios/me/password", json("PATCH", data));

// Solo ADMIN
export const listUsersRequest = ({ page, size, sort }) => {
  const params = new URLSearchParams({ page, size, sort });
  return fetchApi(`/usuarios?${params}`);
};
export const updateUserRequest = (id, data) =>
  fetchApi(`/usuarios/${id}`, json("PUT", data));
export const deleteUserRequest = (id) =>
  fetchApi(`/usuarios/${id}`, { method: "DELETE" });
