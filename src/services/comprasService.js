import { api } from "../api/apiClient";

export function createCompra(data) {
  return api.post("/compras", data);
}

export function listMyCompras() {
  return api.get("/compras/me");
}

export function getSillasOcupadas(idFuncion) {
  return api.get(`/compras/funcion/${idFuncion}/sillas-ocupadas`);
}

export function getCompraById(id) {
  return api.get(`/compras/${id}`);
}

export function listCompras({ page = 0, size = 10, sort = "id,desc" } = {}) {
  return api.get("/compras", { params: { page, size, sort } });
}
