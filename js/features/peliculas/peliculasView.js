import { requireAuth } from "../../core/auth/session.js";
import { renderNavbar } from "../../core/ui/navbar.js";
import {
  clearFieldErrors,
  escapeHtml,
  hideAlert,
  showAlert,
  showFieldErrors,
  setLoading,
  showToast,
} from "../../core/ui/alerts.js";
import {
  listPeliculas,
  createPelicula,
  updatePelicula,
  deletePelicula,
} from "./peliculasService.js";

const session = requireAuth({ adminOnly: true });
const formCard = document.getElementById("form-card");
const form = document.getElementById("movie-form");
const pageAlert = document.getElementById("alert");
const formAlert = document.getElementById("form-alert");
const deleteAlert = document.getElementById("delete-alert");
const tbody = document.getElementById("movies-body");
const pagination = document.getElementById("pagination");
const summary = document.getElementById("summary");
const pageSizeSelect = document.getElementById("page-size");

const deleteModal = new bootstrap.Modal(
  document.getElementById("delete-modal"),
);

const state = { page: 0, size: 10, sort: "id,asc" };
let peliculas = [];
let editingId = null;
let peliculaSeleccionada = null;

if (session) init();

function init() {
  renderNavbar("peliculas");
  document
    .getElementById("btn-new")
    .addEventListener("click", () => openForm());
  document.getElementById("btn-cancel").addEventListener("click", closeForm);
  form.addEventListener("submit", saveForm);
  tbody.addEventListener("click", onAction);
  pagination.addEventListener("click", onPageClick);
  pageSizeSelect.addEventListener("change", () => {
    state.size = Number(pageSizeSelect.value);
    state.page = 0;
    loadPeliculas();
  });
  document
    .getElementById("btn-delete-confirm")
    .addEventListener("click", onDeleteConfirm);

  loadPeliculas();
}

async function loadPeliculas() {
  hideAlert(pageAlert);
  tbody.innerHTML =
    '<tr><td colspan="6" class="text-center text-muted py-4">Cargando películas...</td></tr>';
  try {
    const result = await listPeliculas(state);
    peliculas = Array.isArray(result) ? result : (result.content ?? []);
    const meta = result.page ?? result;
    renderRows();
    if (!Array.isArray(result)) {
      renderPagination(meta);
    }
  } catch (error) {
    tbody.innerHTML = "";
    pagination.innerHTML = "";
    summary.textContent = "";
    showAlert(pageAlert, error.message);
  }
}

function renderRows() {
  if (!peliculas.length) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="text-center text-muted py-4">No hay películas registradas.</td></tr>';
    return;
  }
  tbody.innerHTML = peliculas
    .map(
      (p) => `
    <tr>
      <td class="fw-bold">${p.id}</td>
      <td class="fw-semibold">${escapeHtml(p.titulo)}</td>
      <td>${escapeHtml(p.genero || "—")}</td>
      <td>${p.duracionMinutos} min</td>
      <td class="text-break" style="min-width: 220px; max-width: 420px;">${escapeHtml(p.sinopsis || "—")}</td>
      <td class="text-end text-nowrap">
        <button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${p.id}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${p.id}">Eliminar</button>
      </td>
    </tr>`,
    )
    .join("");
}

function renderPagination(meta) {
  const { number, totalPages, totalElements } = meta;
  const from = totalElements === 0 ? 0 : number * state.size + 1;
  const to = Math.min((number + 1) * state.size, totalElements);
  summary.textContent = `Mostrando ${from}–${to} de ${totalElements} películas`;

  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  const start = Math.max(0, Math.min(number - 2, totalPages - 5));
  const end = Math.min(totalPages, start + 5);

  const item = (label, page, { disabled = false, active = false } = {}) => `
    <li class="page-item ${disabled ? "disabled" : ""} ${active ? "active" : ""}">
      <button class="page-link" type="button" data-page="${page}"
              ${active ? 'aria-current="page"' : ""}>${label}</button>
    </li>`;

  let html = item("Anterior", number - 1, { disabled: number === 0 });
  for (let p = start; p < end; p++) {
    html += item(p + 1, p, { active: p === number });
  }
  html += item("Siguiente", number + 1, { disabled: number >= totalPages - 1 });

  pagination.innerHTML = html;
}

function onPageClick(event) {
  const button = event.target.closest("[data-page]");
  if (!button || button.closest(".disabled")) return;

  state.page = Number(button.dataset.page);
  loadPeliculas();
}

function openForm(pelicula = null) {
  editingId = pelicula?.id ?? null;
  hideAlert(formAlert);
  clearFieldErrors(form);
  form.reset();
  document.getElementById("form-title").textContent = editingId
    ? "Editar película"
    : "Crear película";
  document.getElementById("btn-save").textContent = editingId
    ? "Guardar cambios"
    : "Guardar película";
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
  clearFieldErrors(form);
}

async function saveForm(event) {
  event.preventDefault();
  hideAlert(formAlert);
  clearFieldErrors(form);

  const data = {
    titulo: form.elements.titulo.value.trim(),
    genero: form.elements.genero.value.trim() || null,
    duracionMinutos: Number(form.elements.duracionMinutos.value),
    sinopsis: form.elements.sinopsis.value.trim() || null,
  };

  if (!data.titulo) {
    form.elements.titulo.classList.add("is-invalid");
    showAlert(formAlert, "El título es obligatorio.");
    return;
  }
  if (!Number.isInteger(data.duracionMinutos) || data.duracionMinutos < 1) {
    form.elements.duracionMinutos.classList.add("is-invalid");
    showAlert(
      formAlert,
      "La duración debe ser un número entero mayor que cero.",
    );
    return;
  }

  const button = document.getElementById("btn-save");
  setLoading(button, true, "Guardando...");
  const wasEditing = editingId !== null;

  try {
    if (wasEditing) await updatePelicula(editingId, data);
    else await createPelicula(data);
    closeForm();
    showToast(
      wasEditing ? "Se ha editado la película." : "Se ha creado la película.",
    );
    await loadPeliculas();
  } catch (error) {
    if (!showFieldErrors(form, error.data)) {
      showAlert(formAlert, error.message);
    }
  } finally {
    setLoading(button, false);
  }
}

function onAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const pelicula = peliculas.find((p) => p.id === Number(button.dataset.id));
  if (!pelicula) return;

  if (button.dataset.action === "edit") {
    openForm(pelicula);
  } else {
    openDeleteModal(pelicula);
  }
}

function openDeleteModal(pelicula) {
  peliculaSeleccionada = pelicula;
  hideAlert(deleteAlert);
  document.getElementById("delete-name").textContent = pelicula.titulo;
  deleteModal.show();
}

async function onDeleteConfirm(event) {
  if (!peliculaSeleccionada) return;

  const button = event.currentTarget;
  hideAlert(deleteAlert);
  setLoading(button, true, "Eliminando...");

  try {
    await deletePelicula(peliculaSeleccionada.id);
    if (editingId === peliculaSeleccionada.id) {
      closeForm();
    }
    if (peliculas.length === 1 && state.page > 0) state.page--;
    deleteModal.hide();
    peliculaSeleccionada = null;
    showToast("Se ha eliminado la película.");
    await loadPeliculas();
  } catch (error) {
    showAlert(deleteAlert, error.message);
  } finally {
    setLoading(button, false);
  }
}
