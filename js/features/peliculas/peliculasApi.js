import { fetchApi } from "../../core/api/apiClient.js";

const json = (method, data) => ({ method, body: JSON.stringify(data) });

export const listPeliculasRequest = ({ page = 0, size = 100, sort = "id,asc" } = {}) => {
  const params = new URLSearchParams({ page, size, sort });
  return fetchApi(`/peliculas?${params}`);
};
export const createPeliculaRequest = (data) => fetchApi("/peliculas", json("POST", data));
export const updatePeliculaRequest = (id, data) => fetchApi(`/peliculas/${id}`, json("PUT", data));
export const deletePeliculaRequest = (id) => fetchApi(`/peliculas/${id}`, { method: "DELETE" });
