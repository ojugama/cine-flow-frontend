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
  listFunciones,
  getPeliculasOpcion,
  getSalasOpcion,
  createFuncion,
  updateFuncion,
  deleteFuncion,
} from "./funcionesService.js";

const session = requireAuth({ adminOnly: true });
const formCard = document.getElementById("form-card");
const form = document.getElementById("function-form");
const pageAlert = document.getElementById("alert");
const formAlert = document.getElementById("form-alert");
const deleteAlert = document.getElementById("delete-alert");
const tbody = document.getElementById("functions-body");
const pagination = document.getElementById("pagination");
const summary = document.getElementById("summary");
const pageSizeSelect = document.getElementById("page-size");

const deleteModal = new bootstrap.Modal(
  document.getElementById("delete-modal"),
);

const state = { page: 0, size: 10, sort: "id,asc" };
let editingId = null;
let funcionSeleccionada = null;
let funciones = [];
let todasLasSalas = [];
let todasLasPeliculas = []; // Nueva variable para guardar las películas

if (session) init();

async function init() {
  renderNavbar("funciones");

  document
    .getElementById("btn-new")
    .addEventListener("click", () => openForm());
  document.getElementById("btn-cancel").addEventListener("click", closeForm);
  form.addEventListener("submit", saveForm);

  // Agregamos los listeners para calcular la fecha fin automáticamente
  form.elements.idPelicula.addEventListener("change", calcularFechaFin);
  form.elements.fechaHoraInicio.addEventListener("change", calcularFechaFin);

  tbody.addEventListener("click", onAction);
  pagination.addEventListener("click", onPageClick);
  pageSizeSelect.addEventListener("change", () => {
    state.size = Number(pageSizeSelect.value);
    state.page = 0;
    loadFunciones();
  });
  document
    .getElementById("btn-delete-confirm")
    .addEventListener("click", onDeleteConfirm);

  try {
    const [moviesResult, roomsResult] = await Promise.all([
      getPeliculasOpcion(),
      getSalasOpcion(),
    ]);

    // Guardamos las películas en la variable global
    todasLasPeliculas = Array.isArray(moviesResult)
      ? moviesResult
      : (moviesResult.content ?? []);

    todasLasSalas = Array.isArray(roomsResult)
      ? roomsResult
      : (roomsResult.content ?? []);

    document.getElementById("idPelicula").innerHTML =
      '<option value="">Selecciona una película</option>' +
      todasLasPeliculas
        .map(
          (p) =>
            `<option value="${p.id}">${escapeHtml(p.titulo)} (${p.duracionMinutos} min)</option>`,
        )
        .join("");

    renderRoomOptions();
    await loadFunciones();
  } catch (error) {
    showAlert(pageAlert, error.message);
    tbody.innerHTML = "";
  }
}

async function loadFunciones() {
  hideAlert(pageAlert);
  tbody.innerHTML =
    '<tr><td colspan="7" class="text-center text-muted py-4">Cargando funciones...</td></tr>';
  try {
    const result = await listFunciones(state);
    funciones = Array.isArray(result) ? result : (result.content ?? []);
    const meta = result.page ?? result;
    renderRows();
    if (!Array.isArray(result)) {
      renderPagination(meta);
    }
    actualizarSalasDisponibles();
  } catch (error) {
    tbody.innerHTML = "";
    pagination.innerHTML = "";
    summary.textContent = "";
    showAlert(pageAlert, error.message);
  }
}

function renderRows() {
  if (!funciones.length) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="text-center text-muted py-4">No hay funciones registradas.</td></tr>';
    return;
  }

  tbody.innerHTML = funciones
    .map((f) => {
      const sucursalTexto = f.nombreSucursal
        ? `${escapeHtml(f.nombreSucursal)}${f.ciudadSucursal ? ` (${escapeHtml(f.ciudadSucursal)})` : ""}`
        : "—";
      const salaTexto = f.nombreSala
        ? `${escapeHtml(f.nombreSala)}${f.formatoSala ? ` · <span class="badge text-bg-secondary">${escapeHtml(f.formatoSala)}</span>` : ""}`
        : `Sala ${f.idSala}`;

      return `
      <tr>
        <td class="fw-bold">${f.id}</td>
        <td class="fw-semibold">${escapeHtml(f.tituloPelicula || `Película ${f.idPelicula}`)}</td>
        <td>${sucursalTexto}</td>
        <td>${salaTexto}</td>
        <td>${formatDate(f.fechaHoraInicio)}</td>
        <td>${formatDate(f.fechaHoraFin)}</td>
        <td class="text-end text-nowrap">
          <button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${f.id}">Editar</button>
          <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${f.id}">Eliminar</button>
        </td>
      </tr>`;
    })
    .join("");
}

function renderPagination(meta) {
  const { number, totalPages, totalElements } = meta;
  const from = totalElements === 0 ? 0 : number * state.size + 1;
  const to = Math.min((number + 1) * state.size, totalElements);
  summary.textContent = `Mostrando ${from}–${to} de ${totalElements} funciones`;

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
  loadFunciones();
}

function formatDate(value) {
  return value
    ? new Date(value).toLocaleString("es-CO", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "—";
}

function localInput(value) {
  return value ? value.slice(0, 16) : "";
}

// Nueva función que calcula la fecha de fin y actualiza las salas
function calcularFechaFin() {
  const peliculaId = Number(form.elements.idPelicula.value);
  const fechaInicioStr = form.elements.fechaHoraInicio.value;

  if (peliculaId && fechaInicioStr) {
    const pelicula = todasLasPeliculas.find((p) => p.id === peliculaId);

    if (pelicula && pelicula.duracionMinutos) {
      const fechaInicio = new Date(fechaInicioStr);

      // Sumamos la duración (en minutos * 60000 milisegundos)
      const fechaFin = new Date(
        fechaInicio.getTime() + pelicula.duracionMinutos * 60000,
      );

      // Ajustamos al huso horario local para que formatee bien en el input datetime-local
      const tzOffset = fechaFin.getTimezoneOffset() * 60000;
      const localISOTime = new Date(fechaFin.getTime() - tzOffset)
        .toISOString()
        .slice(0, 16);

      form.elements.fechaHoraFin.value = localISOTime;
    }
  }

  actualizarSalasDisponibles();
}

function openForm(funcion = null) {
  editingId = funcion?.id ?? null;
  hideAlert(formAlert);
  clearFieldErrors(form);
  form.reset();
  document.getElementById("form-title").textContent = editingId
    ? "Editar función"
    : "Crear función";
  document.getElementById("btn-save").textContent = editingId
    ? "Guardar cambios"
    : "Guardar función";

  if (funcion) {
    form.elements.idPelicula.value = funcion.idPelicula;
    form.elements.fechaHoraInicio.value = localInput(funcion.fechaHoraInicio);
    form.elements.fechaHoraFin.value = localInput(funcion.fechaHoraFin);
  }

  renderRoomOptions(funcion?.idSala ?? null);
  if (funcion) {
    form.elements.idSala.value = funcion.idSala;
  }

  formCard.classList.remove("d-none");
  formCard.scrollIntoView({ behavior: "smooth", block: "start" });
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

  const idPelicula = Number(form.elements.idPelicula.value);
  const idSala = Number(form.elements.idSala.value);
  const fechaHoraInicio = form.elements.fechaHoraInicio.value;
  const fechaHoraFin = form.elements.fechaHoraFin.value;

  if (!idPelicula) {
    form.elements.idPelicula.classList.add("is-invalid");
    showAlert(formAlert, "Selecciona una película.");
    return;
  }
  if (!idSala) {
    form.elements.idSala.classList.add("is-invalid");
    showAlert(formAlert, "Selecciona una sala.");
    return;
  }
  if (!fechaHoraInicio || !fechaHoraFin) {
    showAlert(formAlert, "Las fechas de inicio y fin son obligatorias.");
    return;
  }
  if (new Date(fechaHoraFin) <= new Date(fechaHoraInicio)) {
    form.elements.fechaHoraFin.classList.add("is-invalid");
    showAlert(
      formAlert,
      "La fecha y hora de fin debe ser posterior a la de inicio.",
    );
    return;
  }

  const button = document.getElementById("btn-save");
  setLoading(button, true, "Guardando...");
  const wasEditing = editingId !== null;
  const data = { idPelicula, idSala, fechaHoraInicio, fechaHoraFin };

  try {
    if (wasEditing) await updateFuncion(editingId, data);
    else await createFuncion(data);
    closeForm();
    showToast(
      wasEditing ? "Se ha actualizado la función." : "Se ha creado la función.",
    );
    await loadFunciones();
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

  const funcion = funciones.find((f) => f.id === Number(button.dataset.id));
  if (!funcion) return;

  if (button.dataset.action === "edit") {
    openForm(funcion);
  } else {
    openDeleteModal(funcion);
  }
}

function openDeleteModal(funcion) {
  funcionSeleccionada = funcion;
  hideAlert(deleteAlert);
  const pelicula = funcion.tituloPelicula || `Película ${funcion.idPelicula}`;
  const sala = funcion.nombreSala || `Sala ${funcion.idSala}`;
  document.getElementById("delete-name").textContent =
    `${pelicula} (${sala} - ${formatDate(funcion.fechaHoraInicio)})`;
  deleteModal.show();
}

async function onDeleteConfirm(event) {
  if (!funcionSeleccionada) return;

  const button = event.currentTarget;
  hideAlert(deleteAlert);
  setLoading(button, true, "Eliminando...");

  try {
    await deleteFuncion(funcionSeleccionada.id);
    if (editingId === funcionSeleccionada.id) {
      closeForm();
    }
    if (funciones.length === 1 && state.page > 0) state.page--;
    deleteModal.hide();
    funcionSeleccionada = null;
    showToast("Se ha eliminado la función.");
    await loadFunciones();
  } catch (error) {
    showAlert(deleteAlert, error.message);
  } finally {
    setLoading(button, false);
  }
}

function renderRoomOptions(keepRoomId = null) {
  const select = document.getElementById("idSala");
  const start = form.elements.fechaHoraInicio.value;
  const end = form.elements.fechaHoraFin.value;
  const validDates = start && end && new Date(end) > new Date(start);

  const rooms = todasLasSalas.filter((room) => {
    if (!validDates) return true;
    return !funciones.some(
      (f) =>
        f.id !== editingId &&
        f.idSala === room.id &&
        new Date(f.fechaHoraInicio) < new Date(end) &&
        new Date(f.fechaHoraFin) > new Date(start),
    );
  });

  if (keepRoomId && !rooms.some((r) => r.id === keepRoomId)) {
    const current = todasLasSalas.find((r) => r.id === keepRoomId);
    if (current) rooms.unshift(current);
  }

  const currentValue = keepRoomId ?? select.value;
  select.innerHTML =
    '<option value="">Selecciona una sala disponible</option>' +
    rooms
      .map((s) => {
        const sucursal = escapeHtml(s.nombreSucursal || "Sucursal");
        const ciudad = s.ciudadSucursal
          ? ` (${escapeHtml(s.ciudadSucursal)})`
          : "";
        const sala = escapeHtml(s.nombre || `Sala ${s.id}`);
        const formato = s.formato ? ` · ${escapeHtml(s.formato)}` : "";
        return `<option value="${s.id}">${sucursal}${ciudad} — ${sala}${formato}</option>`;
      })
      .join("");

  if (currentValue && rooms.some((r) => r.id === Number(currentValue))) {
    select.value = currentValue;
  }
}

function actualizarSalasDisponibles() {
  renderRoomOptions();
}
