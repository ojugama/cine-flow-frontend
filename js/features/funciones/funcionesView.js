import { requireAuth } from "../../core/auth/session.js";
import { renderNavbar } from "../../core/ui/navbar.js";
import { escapeHtml, hideAlert, showAlert, setLoading, showToast } from "../../core/ui/alerts.js";
import { listFunciones, getPeliculasOpcion, getSalasOpcion, createFuncion, updateFuncion, deleteFuncion } from "./funcionesService.js";
const session = requireAuth();
const formCard = document.getElementById("form-card");
const form = document.getElementById("function-form");
const pageAlert = document.getElementById("alert");
const formAlert = document.getElementById("form-alert");
const tbody = document.getElementById("functions-body");
let editingId = null;
let funciones = [];
let todasLasSalas = [];
if (session) init();
async function init() {
  renderNavbar("funciones");
  if (session.rol !== "ADMIN") {
    document.getElementById("btn-new").remove();
    document.querySelectorAll(".admin-action").forEach((el) => el.remove());
  }
  document.getElementById("btn-new")?.addEventListener("click", () => openForm());
  document.getElementById("btn-cancel").addEventListener("click", closeForm);
  form.addEventListener("submit", saveForm);
  form.elements.fechaHoraInicio.addEventListener("change", actualizarSalasDisponibles);
  form.elements.fechaHoraFin.addEventListener("change", actualizarSalasDisponibles);
  tbody.addEventListener("click", onAction);
  try {
    const [movies, rooms] = await Promise.all([getPeliculasOpcion(), getSalasOpcion()]);
    todasLasSalas = rooms;
    document.getElementById("idPelicula").innerHTML = '<option value="">Selecciona una película</option>' + movies.map(p => `<option value="${p.id}">${escapeHtml(p.titulo)} (${p.duracionMinutos} min)</option>`).join("");
    renderRoomOptions();
    await loadFunciones();
  } catch (error) { showAlert(pageAlert, error.message); tbody.innerHTML = ""; }
}
async function loadFunciones() {
  hideAlert(pageAlert);
  try { funciones = await listFunciones(); renderRows(); actualizarSalasDisponibles(); }
  catch (error) { showAlert(pageAlert, error.message); }
}
function renderRows() {
  if (!funciones.length) { tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No hay funciones registradas.</td></tr>'; return; }
  tbody.innerHTML = funciones.map(f => `<tr><td>${f.id}</td><td>${escapeHtml(f.peliculaTitulo || `Película ${f.idPelicula}`)}</td><td>${escapeHtml(f.sucursalNombre || "—")}</td><td>${escapeHtml(f.salaNombre || `Sala ${f.idSala}`)}</td><td>${formatDate(f.fechaHoraInicio)}</td><td>${formatDate(f.fechaHoraFin)}</td>${session.rol === "ADMIN" ? `<td class="text-end text-nowrap"><button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${f.id}">Editar</button><button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${f.id}">Eliminar</button></td>` : ""}</tr>`).join("");
}
function formatDate(value) { return value ? new Date(value).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" }) : "—"; }
function localInput(value) { return value ? value.slice(0, 16) : ""; }
function openForm(funcion = null) {
  editingId = funcion?.id ?? null; hideAlert(formAlert); form.reset();
  document.getElementById("form-title").textContent = editingId ? "Editar función" : "Crear función";
  document.getElementById("btn-save").textContent = editingId ? "Guardar cambios" : "Guardar función";
  if (funcion) {
    form.elements.idPelicula.value = funcion.idPelicula;
    form.elements.idSala.value = funcion.idSala;
    form.elements.fechaHoraInicio.value = localInput(funcion.fechaHoraInicio);
    form.elements.fechaHoraFin.value = localInput(funcion.fechaHoraFin);
  }
  renderRoomOptions(funcion?.idSala ?? null);
  formCard.classList.remove("d-none"); formCard.scrollIntoView({ behavior: "smooth", block: "start" });
}
function closeForm() { formCard.classList.add("d-none"); form.reset(); editingId = null; hideAlert(formAlert); }
async function saveForm(event) {
  event.preventDefault(); hideAlert(formAlert);
  const button = document.getElementById("btn-save"); setLoading(button, true, "Guardando...");
  const data = { idPelicula: Number(form.elements.idPelicula.value), idSala: Number(form.elements.idSala.value), fechaHoraInicio: form.elements.fechaHoraInicio.value, fechaHoraFin: form.elements.fechaHoraFin.value };
  if (new Date(data.fechaHoraFin) <= new Date(data.fechaHoraInicio)) { showAlert(formAlert, "La fecha y hora de fin debe ser posterior al inicio."); setLoading(button, false); return; }
  try { if (editingId) await updateFuncion(editingId, data); else await createFuncion(data); closeForm(); showToast(editingId ? "Se ha actualizado la función." : "Se ha creado la función."); await loadFunciones(); }
  catch (error) { showAlert(formAlert, error.message); }
  finally { setLoading(button, false); }
}
async function onAction(event) {
  const button = event.target.closest("[data-action]"); if (!button) return;
  const funcion = funciones.find(f => f.id === Number(button.dataset.id)); if (!funcion) return;
  if (button.dataset.action === "edit") { openForm(funcion); return; }
  try { await deleteFuncion(funcion.id); showToast("Se ha eliminado la función."); await loadFunciones(); }
  catch (error) { showAlert(pageAlert, error.message); }
}

function renderRoomOptions(keepRoomId = null) {
  const select = document.getElementById("idSala");
  const start = form.elements.fechaHoraInicio.value;
  const end = form.elements.fechaHoraFin.value;
  const validDates = start && end && new Date(end) > new Date(start);
  const rooms = todasLasSalas.filter(room => {
    if (!validDates) return true;
    return !funciones.some(f => f.id !== editingId && f.idSala === room.id && new Date(f.fechaHoraInicio) < new Date(end) && new Date(f.fechaHoraFin) > new Date(start));
  });
  if (keepRoomId && !rooms.some(r => r.id === keepRoomId)) {
    const current = todasLasSalas.find(r => r.id === keepRoomId); if (current) rooms.unshift(current);
  }
  const currentValue = keepRoomId ?? select.value;
  select.innerHTML = '<option value="">Selecciona una sala disponible</option>' + rooms.map(s => `<option value="${s.id}">${escapeHtml(s.sucursalNombre || "Sucursal")} · ${escapeHtml(s.ciudad || "")} · ${escapeHtml(s.nombre || `Sala ${s.id}`)}${s.formato ? ` (${escapeHtml(s.formato)})` : ""}${validDates && funciones.some(f => f.idSala === s.id && f.id !== editingId && new Date(f.fechaHoraInicio) < new Date(end) && new Date(f.fechaHoraFin) > new Date(start)) ? ' · ocupada en este horario' : ''}</option>`).join("");
  if (currentValue && rooms.some(r => r.id === Number(currentValue))) select.value = currentValue;
}
function actualizarSalasDisponibles() { renderRoomOptions(); }
