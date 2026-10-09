import { listPeliculasRequest, createPeliculaRequest, updatePeliculaRequest, deletePeliculaRequest } from "./peliculasApi.js";

export const listPeliculas = async (query) => (await listPeliculasRequest(query)).data;
export const createPelicula = async (data) => (await createPeliculaRequest(data)).data;
export const updatePelicula = async (id, data) => (await updatePeliculaRequest(id, data)).data;
export const deletePelicula = async (id) => { await deletePeliculaRequest(id); };
