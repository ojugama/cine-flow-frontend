import { listFuncionesRequest, getFuncionOptionsMoviesRequest, getFuncionOptionsRoomsRequest, createFuncionRequest, updateFuncionRequest, deleteFuncionRequest } from "./funcionesApi.js";
export const listFunciones = async () => (await listFuncionesRequest()).data;
export const getPeliculasOpcion = async () => (await getFuncionOptionsMoviesRequest()).data;
export const getSalasOpcion = async () => (await getFuncionOptionsRoomsRequest()).data;
export const createFuncion = async (data) => (await createFuncionRequest(data)).data;
export const updateFuncion = async (id, data) => (await updateFuncionRequest(id, data)).data;
export const deleteFuncion = async (id) => { await deleteFuncionRequest(id); };
