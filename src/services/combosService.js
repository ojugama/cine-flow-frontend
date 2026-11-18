import { api } from "../api/apiClient";

export function listCombos() {
  return api.get("/combos");
}

export function getComboById(id) {
  return api.get(`/combos/${id}`);
}
