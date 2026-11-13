import { api } from "../api/apiClient";

export function listPeliculas({ page = 0, size = 10, sort = "id,asc" } = {}) {
  return api.get("/peliculas", { params: { page, size, sort } });
}

export function getPeliculaById(id) {
  return api.get(`/peliculas/${id}`);
}

export function createPelicula(data) {
  return api.post("/peliculas", data);
}

export function updatePelicula(id, data) {
  return api.put(`/peliculas/${id}`, data);
}

export function deletePelicula(id) {
  return api.patch(`/peliculas/${id}`);
}
