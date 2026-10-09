import { fetchApi } from "../../core/api/apiClient.js";
const json = (method, data) => ({ method, body: JSON.stringify(data) });
export const listFuncionesRequest = () => fetchApi("/funciones");
export const getFuncionOptionsMoviesRequest = () => fetchApi("/peliculas");
export const getFuncionOptionsRoomsRequest = () => fetchApi("/salas");
export const createFuncionRequest = (data) =>
  fetchApi("/funciones", json("POST", data));
export const updateFuncionRequest = (id, data) =>
  fetchApi(`/funciones/${id}`, json("PUT", data));
export const deleteFuncionRequest = (id) =>
  fetchApi(`/funciones/${id}`, { method: "PATCH" });
