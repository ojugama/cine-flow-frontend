import { api } from "../api/apiClient";

export function listFunciones({ page = 0, size = 10, sort = "id,asc" } = {}) {
  return api.get("/funciones", { params: { page, size, sort } });
}

export function getPeliculasOpcion() {
  return api.get("/peliculas", {
    params: { page: 0, size: 100, sort: "titulo,asc" },
  });
}

export function listFuncionesByPelicula(idPelicula) {
  return api.get(`/funciones/pelicula/${idPelicula}`);
}

export function getFuncionById(id) {
  return api.get(`/funciones/${id}`);
}

export function getSalasOpcion() {
  return api.get("/salas", {
    params: { page: 0, size: 100, sort: "id,asc" },
  });
}

export function createFuncion(data) {
  return api.post("/funciones", data);
}

export function updateFuncion(id, data) {
  return api.put(`/funciones/${id}`, data);
}

export function deleteFuncion(id) {
  return api.patch(`/funciones/${id}`);
}
