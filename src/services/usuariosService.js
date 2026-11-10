import { api } from "../api/apiClient";
import { saveToken } from "../auth/session";

export async function registerUsuario(userData) {
  try {
    const response = await api.post("/usuarios", userData, { skipAuth: true });
    return {
      success: true,
      message: response.message,
      data: response.data,
    };
  } catch (error) {
    return { success: false, message: error.message, errors: error.data };
  }
}

export async function getUsuarios({ page = 0, size = 10, sort = "id,asc" } = {}) {
  try {
    const response = await api.get("/usuarios", {
      params: { page, size, sort },
    });

    return {
      success: true,
      data: response.data?.content ?? [],
      pageData: response.data,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function getUsuarioById(id) {
  try {
    const response = await api.get(`/usuarios/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function updateUsuario(id, userData) {
  try {
    const response = await api.put(`/usuarios/${id}`, userData);
    return {
      success: true,
      message: response.message,
      data: response.data,
    };
  } catch (error) {
    return { success: false, message: error.message, errors: error.data };
  }
}

export async function desactivateUsuario(id) {
  try {
    const response = await api.patch(`/usuarios/${id}`);
    return { success: true, message: response.message };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function getMyProfile() {
  try {
    const response = await api.get("/usuarios/me");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function updateMyProfile(userData) {
  try {
    const response = await api.put("/usuarios/me", userData);

    if (response.data?.token) {
      saveToken(response.data.token);
    }

    return {
      success: true,
      message: response.message,
      data: response.data,
    };
  } catch (error) {
    return { success: false, message: error.message, errors: error.data };
  }
}

export async function updateMyPassword(passwordData) {
  try {
    const response = await api.patch("/usuarios/me/password", passwordData);
    return { success: true, message: response.message };
  } catch (error) {
    return { success: false, message: error.message, errors: error.data };
  }
}

export async function deleteMyProfile() {
  try {
    const response = await api.patch("/usuarios/me");
    return { success: true, message: response.message };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
