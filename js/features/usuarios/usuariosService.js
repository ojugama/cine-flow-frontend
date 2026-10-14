import {
  registerUsuarioRequest,
  getUsuariosRequest,
  getUsuarioByIdRequest,
  updateUsuarioRequest,
  deleteUsuarioRequest,
  getMyProfileRequest,
  updateMyProfileRequest,
  deleteMyProfileRequest,
  updateMyPasswordRequest,
} from "./usuariosApi.js";
import { saveToken } from "../../core/auth/session.js";

export async function registerUsuario(userData) {
  try {
    const responseData = await registerUsuarioRequest(userData);

    return {
      success: true,
      message: responseData.message,
      data: responseData.data,
    };
  } catch (error) {
    console.error("Ha ocurrido un error en el registro de usuario: ", error);
    return { success: false, message: error.message, errors: error.data };
  }
}

export async function getUsuarios(query) {
  try {
    const responseData = await getUsuariosRequest(query);

    return {
      success: true,
      data: responseData.data.content ?? [],
      pageData: responseData.data,
    };
  } catch (error) {
    console.error("Ha ocurrido un error al obtener los usuarios: ", error);

    return { success: false, message: error.message };
  }
}

export async function getUsuarioById(id) {
  try {
    const responseData = await getUsuarioByIdRequest(id);

    return { success: true, data: responseData.data };
  } catch (error) {
    console.error("Ha ocurrido un error al obtener el usuario: ", error);

    return { success: false, message: error.message };
  }
}

export async function updateUsuario(id, userData) {
  try {
    const responseData = await updateUsuarioRequest(id, userData);

    return {
      success: true,
      message: responseData.message,
      data: responseData.data,
    };
  } catch (error) {
    console.error("Ha ocurrido un error al actualizar el usuario: ", error);

    return { success: false, message: error.message, errors: error.data };
  }
}

export async function desactivateUsuario(id) {
  try {
    const responseData = await deleteUsuarioRequest(id);

    return { success: true, message: responseData.message };
  } catch (error) {
    console.error("Ha ocurrido un error al desactivar el usuario: ", error);

    return { success: false, message: error.message };
  }
}

export async function getMyProfile() {
  try {
    const responseData = await getMyProfileRequest();

    return { success: true, data: responseData.data };
  } catch (error) {
    console.error("Ha ocurrido un error al obtener perfil: ", error);

    return { success: false, message: error.message };
  }
}

export async function updateMyProfile(userData) {
  try {
    const responseData = await updateMyProfileRequest(userData);

    if (responseData.data?.token) {
      saveToken(responseData.data.token);
    }

    return {
      success: true,
      message: responseData.message,
      data: responseData.data,
    };
  } catch (error) {
    console.error("Ha ocurrido un error al actualizar perfil: ", error);

    return { success: false, message: error.message, errors: error.data };
  }
}

export async function updateMyPassword(passwordData) {
  try {
    const responseData = await updateMyPasswordRequest(passwordData);

    return { success: true, message: responseData.message };
  } catch (error) {
    console.error("Ha ocurrido un error al cambiar contraseña: ", error);

    return { success: false, message: error.message, errors: error.data };
  }
}

export async function deleteMyProfile() {
  try {
    const responseData = await deleteMyProfileRequest();

    return { success: true, message: responseData.message };
  } catch (error) {
    console.error("Ha ocurrido un error al eliminar cuenta: ", error);

    return { success: false, message: error.message };
  }
}
