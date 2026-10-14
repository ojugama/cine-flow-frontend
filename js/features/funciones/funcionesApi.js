import { fetchApi } from "../../core/api/apiClient.js";

const json = (method, data) => ({ method, body: JSON.stringify(data) });

export const listFuncionesRequest = ({
  page = 0,
  size = 10,
  sort = "id,asc",
} = {}) => {
  const params = new URLSearchParams({ page, size, sort });
  return fetchApi(`/funciones?${params}`);
};

export const getFuncionOptionsMoviesRequest = () =>
  fetchApi("/peliculas?page=0&size=100&sort=titulo,asc");

export const getFuncionOptionsRoomsRequest = () =>
  fetchApi("/salas?page=0&size=100&sort=id,asc");

export const createFuncionRequest = (data) =>
  fetchApi("/funciones", json("POST", data));

export const updateFuncionRequest = (id, data) =>
  fetchApi(`/funciones/${id}`, json("PUT", data));

export const deleteFuncionRequest = (id) =>
  fetchApi(`/funciones/${id}`, { method: "PATCH" });
