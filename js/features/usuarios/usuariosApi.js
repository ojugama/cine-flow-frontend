import { fetchApi } from "../../core/api/apiClient.js";

export async function registerUsuarioRequest(userData) {
  return await fetchApi("/usuarios", {
    method: "POST",
    auth: false,
    body: JSON.stringify(userData),
  });
}

export async function getUsuariosRequest({
  page = 0,
  size = 10,
  sort = "id,asc",
} = {}) {
  const params = new URLSearchParams({ page, size, sort });

  return await fetchApi(`/usuarios?${params}`, {
    method: "GET",
  });
}

export async function getUsuarioByIdRequest(id) {
  return await fetchApi(`/usuarios/${id}`, {
    method: "GET",
  });
}

export async function updateUsuarioRequest(id, userData) {
  return await fetchApi(`/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  });
}

export async function deleteUsuarioRequest(id) {
  return await fetchApi(`/usuarios/${id}`, {
    method: "PATCH",
  });
}

export async function getMyProfileRequest() {
  return await fetchApi("/usuarios/me", {
    method: "GET",
  });
}

export async function updateMyProfileRequest(userData) {
  return await fetchApi("/usuarios/me", {
    method: "PUT",
    body: JSON.stringify(userData),
  });
}

export async function deleteMyProfileRequest() {
  return await fetchApi("/usuarios/me", {
    method: "PATCH",
  });
}

export async function updateMyPasswordRequest(passwordData) {
  return await fetchApi("/usuarios/me/password", {
    method: "PATCH",
    body: JSON.stringify(passwordData),
  });
}
