import {
  registerUsuarioRequest,
  getUsuariosRequest,
  updateUsuarioRequest,
  deleteUsuarioRequest,
  getMyProfileRequest,
  updateMyProfileRequest,
  deleteMyProfileRequest,
  updateMyPasswordRequest,
} from "./usuarioApi.js";

export async function registerUsuario(userData) {
  try {
    const responseData = await registerUsuarioRequest(userData);
    return { success: true, message: responseData.message };
  } catch (error) {
    console.error("Ha ocurrido un error en el registro de usuario: ", error);
    return { success: false, message: error.message };
  }
}

export async function getUsuarios() {
  try {
    const responseData = await getUsuariosRequest();

    return { success: true, data: responseData.data.content };
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
    console.error(`Ha ocurrido un error al obtener el usuario: `, error);

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
    console.error(`Ha ocurrido un error al actualizar el usuario: `, error);

    return { success: false, message: error.message };
  }
}

export async function desactivateUsuario(id) {
  try {
    const responseData = await deleteUsuarioRequest(id);

    return { success: true, message: responseData.message };
  } catch (error) {
    console.error(`Ha ocurrido un error al desactivar el usuario: `, error);

    return { success: false, message: error.message };
  }
}

export async function getMyProfile() {
  try {
    const responseData = await getMyProfileRequest();
    return { success: true, data: responseData.data };
  } catch (error) {
    console.error("Error al obtener perfil: ", error);
    return { success: false, message: error.message };
  }
}

export async function updateMyProfile(userData) {
  try {
    const responseData = await updateMyProfileRequest(userData);
    return {
      success: true,
      message: responseData.message,
      data: responseData.data,
    };
  } catch (error) {
    console.error("Error al actualizar perfil: ", error);
    return { success: false, message: error.message };
  }
}

export async function updateMyPassword(passwordData) {
  try {
    const responseData = await updateMyPasswordRequest(passwordData);
    return { success: true, message: responseData.message };
  } catch (error) {
    console.error("Error al cambiar contraseña: ", error);
    return { success: false, message: error.message };
  }
}

export async function deleteMyProfile() {
  try {
    const responseData = await deleteMyProfileRequest();
    return { success: true, message: responseData.message };
  } catch (error) {
    console.error("Error al eliminar cuenta: ", error);
    return { success: false, message: error.message };
  }
}
