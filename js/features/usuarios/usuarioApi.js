import { fetchApi } from "../../core/api/apiClient.js";

export async function registerUsuarioRequest(userData) {
  return await fetchApi("/usuarios", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
}

export async function getUsuariosRequest(id) {
  return await fetchApi("/usuarios", {
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
    headers: {
      "Content-Type": "application/json",
    },
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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
}

export async function deleteMyProfileRequest() {
  return await fetchApi(`/usuarios/me`, {
    method: "PATCH",
  });
}

export async function updateMyPasswordRequest(passwordData) {
  return await fetchApi("/usuarios/me/password", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(passwordData),
  });
}
