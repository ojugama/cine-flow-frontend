import {
  deleteUserRequest,
  getMeRequest,
  listUsersRequest,
  registerRequest,
  updateMeRequest,
  updateMyPasswordRequest,
  updateUserRequest,
} from "./usuariosApi.js";

// Cada función devuelve directamente `data` del ApiResponse.
// Los errores (ApiError) se propagan para que la vista los muestre.

export const registerUser = async (data) => (await registerRequest(data)).data;
export const getMe = async () => (await getMeRequest()).data;
export const updateMe = async (data) => (await updateMeRequest(data)).data;
export const updateMyPassword = async (data) => {
  await updateMyPasswordRequest(data);
};

export const listUsers = async (query) => (await listUsersRequest(query)).data;
export const updateUser = async (id, data) =>
  (await updateUserRequest(id, data)).data;
export const deleteUser = async (id) => {
  await deleteUserRequest(id);
};
