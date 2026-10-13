import { requireAuth, saveToken } from "../../core/auth/session.js";
import { renderNavbar } from "../../core/ui/navbar.js";
import {
  clearFieldErrors,
  escapeHtml,
  hideAlert,
  setLoading,
  showAlert,
  showFieldErrors,
  showToast,
} from "../../core/ui/alerts.js";
import {
  getUsuarios,
  updateUsuario,
  desactivateUsuario,
} from "./usuarioService.js";

const tbody = document.getElementById("users-tbody");
const pagination = document.getElementById("pagination");
const summary = document.getElementById("summary");
const pageAlert = document.getElementById("alert");
const pageSizeSelect = document.getElementById("page-size");

const editForm = document.getElementById("edit-form");
const editAlert = document.getElementById("edit-alert");
const deleteAlert = document.getElementById("delete-alert");
const editModal = new bootstrap.Modal(document.getElementById("edit-modal"));
const deleteModal = new bootstrap.Modal(
  document.getElementById("delete-modal"),
);

const state = { page: 0, size: 10, sort: "id,asc" };
let usuariosLocales = [];
let usuarioSeleccionado = null;

let session = requireAuth({ adminOnly: true });
if (session) init();

function init() {
  renderNavbar("users");

  pageSizeSelect.addEventListener("change", (e) => {
    state.size = Number(pageSizeSelect.value);
    state.page = 0;
    loadTable();
  });

  tbody.addEventListener("click", onRowAction);
  pagination.addEventListener("click", onPageClick);
  editForm.addEventListener("submit", onEditSubmit);
  document
    .getElementById("btn-delete-confirm")
    .addEventListener("click", onDeleteConfirm);

  loadTable();
}

async function loadTable() {
  hideAlert(pageAlert);
  tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Cargando usuarios...</td></tr>`;

  const result = await getUsuarios(state);

  if (result.success) {
    usuariosLocales = result.data;

    const meta = result.pageData.page ?? result.pageData;

    renderizarFilas(usuariosLocales);
    renderPagination(meta);
  } else {
    tbody.innerHTML = "";
    pagination.inertHTML = "";
    summary.textContent = "";
    showAlert(pageAlert, result.message);
  }
}

function renderizarFilas(usuarios) {
  if (usuarios.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No hay usuarios registrados.</td></tr>`;
    return;
  }

  tbody.innerHTML = usuarios
    .map((u) => {
      const isSelf = u.email === session.email;
      const roleClass =
        u.rol === "ADMIN" ? "badge bg-primary" : "badge bg-secondary";
      return `
      <tr>
        <td class="fw-bold">${u.id}</td>
        <td>${escapeHtml(u.nombres)} ${escapeHtml(u.apellidos)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td><span class="badge ${roleClass}">${escapeHtml(u.rol)}</span></td>
        <td class="text-end text-nowrap">
          <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${u.id}" 
          ${isSelf ? "disabled title='Edita tus datos desde Mi Perfil'" : ""}>Editar</button>
          <button class="btn btn-sm btn-outline-danger ms-1" data-action="delete" data-id="${u.id}" 
          ${isSelf || u.rol === "ADMIN" ? "disabled title='No puedes desactivar una cuenta de administrador'" : ""}>Desactivar</button>
        </td>
      </tr>`;
    })
    .join("");
}

function renderPagination(meta) {
  const { number, totalPages, totalElements } = meta;
  const from = totalElements === 0 ? 0 : number * state.size + 1;
  const to = Math.min((number + 1) * state.size, totalElements);
  summary.textContent = `Mostrando ${from}–${to} de ${totalElements} usuarios`;

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
  loadTable();
}

function onRowAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  usuarioSeleccionado = usuariosLocales.find((u) => u.id === id);
  if (!usuarioSeleccionado) return;

  if (button.dataset.action === "edit") {
    abrirModalEdicion(usuarioSeleccionado);
  } else {
    abrirModalDesactivacion(usuarioSeleccionado);
  }
}

function abrirModalEdicion(usuario) {
  hideAlert(editAlert);
  clearFieldErrors(editForm);
  editForm.elements["nombres"].value = usuario.nombres;
  editForm.elements["apellidos"].value = usuario.apellidos;
  editForm.elements["email"].value = usuario.email;
  editModal.show();
}

async function onEditSubmit(event) {
  event.preventDefault();
  if (!usuarioSeleccionado) return;

  hideAlert(editAlert);
  clearFieldErrors(editForm);

  const button = document.getElementById("btn-edit-save");
  setLoading(button, true, "Guardando...");

  const userData = {
    nombres: editForm.elements["nombres"].value.trim(),
    apellidos: editForm.elements["apellidos"].value.trim(),
    email: editForm.elements["email"].value.trim(),
  };

  const result = await updateUsuario(usuarioSeleccionado.id, userData);
  setLoading(button, false);

  if (result.success) {
    if (result.data?.token) {
      saveToken(result.data.token);
      renderNavbar("users");
    }
    editModal.hide();
    usuarioSeleccionado = null;
    showToast("Usuario actualizado correctamente.");
    await loadTable();
  } else {
    if (!showFieldErrors(editForm, result.errors)) {
      showAlert(editAlert, result.message);
    }
  }
}

function abrirModalDesactivacion(usuario) {
  hideAlert(deleteAlert);
  document.getElementById("delete-name").textContent =
    `${usuario.nombres} ${usuario.apellidos} (${usuario.email})`;
  deleteModal.show();
}

async function onDeleteConfirm(event) {
  if (!usuarioSeleccionado) return;

  const button = event.currentTarget;
  hideAlert(deleteAlert);
  setLoading(button, true, "Desactivando...");

  const result = await desactivateUsuario(usuarioSeleccionado.id);
  setLoading(button, false);

  if (result.success) {
    if (usuariosLocales.length === 1 && state.page > 0) state.page--;
    deleteModal.hide();
    usuarioSeleccionado = null;
    showToast("Usuario desactivado correctamente.");
    await loadTable();
  } else {
    showAlert(deleteAlert, result.message);
  }
}
