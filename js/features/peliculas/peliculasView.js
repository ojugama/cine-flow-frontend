import { requireAuth } from "../../core/auth/session.js";
import { renderNavbar } from "../../core/ui/navbar.js";
import { escapeHtml, hideAlert, showAlert, setLoading, showToast } from "../../core/ui/alerts.js";
import { listPeliculas, createPelicula, updatePelicula, deletePelicula } from "./peliculasService.js";

const session = requireAuth({ adminOnly: true });
const formCard = document.getElementById("form-card");
const form = document.getElementById("movie-form");
const pageAlert = document.getElementById("alert");
const formAlert = document.getElementById("form-alert");
const tbody = document.getElementById("movies-body");
let peliculas = [];
let editingId = null;

if (session) init();

function init() {
  renderNavbar("peliculas");
  document.getElementById("btn-new").addEventListener("click", () => openForm());
  document.getElementById("btn-cancel").addEventListener("click", closeForm);
  form.addEventListener("submit", saveForm);
  tbody.addEventListener("click", onAction);
  loadPeliculas();
}

async function loadPeliculas() {
  hideAlert(pageAlert);
  tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Cargando películas...</td></tr>';
  try {
    const result = await listPeliculas({ page: 0, size: 100, sort: "id,asc" });
    peliculas = Array.isArray(result) ? result : (result.content ?? []);
    renderRows();
  } catch (error) {
    tbody.innerHTML = '';
    showAlert(pageAlert, error.message);
  }
}

function renderRows() {
  if (!peliculas.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No hay películas registradas.</td></tr>';
    return;
  }
  tbody.innerHTML = peliculas.map((p) => `
    <tr>
      <td>${p.id}</td>
      <td class="fw-semibold">${escapeHtml(p.titulo)}</td>
      <td>${escapeHtml(p.genero || "—")}</td>
      <td>${p.duracionMinutos} min</td>
      <td class="text-break" style="min-width: 220px; max-width: 420px;">${escapeHtml(p.sinopsis || "—")}</td>
      <td class="text-end text-nowrap">
        <button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${p.id}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${p.id}">Eliminar</button>
      </td>
    </tr>`).join("");
}

function openForm(pelicula = null) {
  editingId = pelicula?.id ?? null;
  hideAlert(formAlert);
  form.reset();
  document.getElementById("form-title").textContent = editingId ? "Editar película" : "Crear película";
  document.getElementById("btn-save").textContent = editingId ? "Guardar cambios" : "Guardar película";
  if (pelicula) {
    form.elements.titulo.value = pelicula.titulo ?? "";
    form.elements.genero.value = pelicula.genero ?? "";
    form.elements.duracionMinutos.value = pelicula.duracionMinutos ?? "";
    form.elements.sinopsis.value = pelicula.sinopsis ?? "";
  }
  formCard.classList.remove("d-none");
  formCard.scrollIntoView({ behavior: "smooth", block: "start" });
  form.elements.titulo.focus();
}

function closeForm() {
  formCard.classList.add("d-none");
  form.reset();
  editingId = null;
  hideAlert(formAlert);
}

async function saveForm(event) {
  event.preventDefault();
  hideAlert(formAlert);
  const data = {
    titulo: form.elements.titulo.value.trim(),
    genero: form.elements.genero.value.trim() || null,
    duracionMinutos: Number(form.elements.duracionMinutos.value),
    sinopsis: form.elements.sinopsis.value.trim() || null,
  };
  if (!data.titulo) { showAlert(formAlert, "El título es obligatorio."); return; }
  if (!Number.isInteger(data.duracionMinutos) || data.duracionMinutos < 1) {
    showAlert(formAlert, "La duración debe ser un número entero mayor que cero."); return;
  }
  const button = document.getElementById("btn-save");
  setLoading(button, true, "Guardando...");
  const wasEditing = editingId !== null;
  try {
    if (wasEditing) await updatePelicula(editingId, data);
    else await createPelicula(data);
    closeForm();
    showToast(wasEditing ? "Se ha editado la película." : "Se ha creado la película.");
    await loadPeliculas();
  } catch (error) {
    showAlert(formAlert, error.message);
  } finally {
    setLoading(button, false);
  }
}

async function onAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const pelicula = peliculas.find((p) => p.id === Number(button.dataset.id));
  if (!pelicula) return;
  if (button.dataset.action === "edit") { openForm(pelicula); return; }
  try {
    await deletePelicula(pelicula.id);
    showToast("Se ha eliminado la película.");
    await loadPeliculas();
  } catch (error) {
    showAlert(pageAlert, error.message);
  }
}
