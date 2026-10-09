import { logout, requireAuth } from "../../core/auth/session.js";
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
import { deleteUser, listUsers, updateUser } from "./usuariosService.js";

const tbody = document.getElementById("users-body");
const pagination = document.getElementById("pagination");
const summary = document.getElementById("summary");
const pageAlert = document.getElementById("alert");
const pageSizeSelect = document.getElementById("page-size");

const editForm = document.getElementById("edit-form");
const editAlert = document.getElementById("edit-alert");
const deleteAlert = document.getElementById("delete-alert");
const editModal = new bootstrap.Modal(document.getElementById("edit-modal"));
const deleteModal = new bootstrap.Modal(document.getElementById("delete-modal"));

const state = { page: 0, size: 10, sort: "id,asc" };
const usersById = new Map();
let selectedUser = null;
let session = null;

session = requireAuth({ adminOnly: true });
if (session) init();

function init() {
  renderNavbar("users");

  pageSizeSelect.addEventListener("change", () => {
    state.size = Number(pageSizeSelect.value);
    state.page = 0;
    loadUsers();
  });

  tbody.addEventListener("click", onRowAction);
  pagination.addEventListener("click", onPageClick);
  editForm.addEventListener("submit", onEditSubmit);
  document
    .getElementById("btn-delete-confirm")
    .addEventListener("click", onDeleteConfirm);

  loadUsers();
}

async function loadUsers() {
  hideAlert(pageAlert);
  tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Cargando usuarios...</td></tr>`;

  try {
    const pageData = await listUsers(state);
    // Spring puede entregar la metadata en la raíz o dentro de `page`
    const meta = pageData.page ?? pageData;

    usersById.clear();
    pageData.content.forEach((u) => usersById.set(u.id, u));

    renderRows(pageData.content);
    renderPagination(meta);
  } catch (error) {
    tbody.innerHTML = "";
    pagination.innerHTML = "";
    summary.textContent = "";
    showAlert(pageAlert, error.message);
  }
}

function renderRows(users) {
  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No hay usuarios registrados.</td></tr>`;
    return;
  }

  tbody.innerHTML = users
    .map((u) => {
      const isSelf = u.email === session.email;
      const roleClass = u.rol === "ADMIN" ? "text-bg-primary" : "text-bg-secondary";
      return `
        <tr>
          <td>${u.id}</td>
          <td>${escapeHtml(u.nombres)} ${escapeHtml(u.apellidos)}</td>
          <td>${escapeHtml(u.email)}</td>
          <td><span class="badge ${roleClass}">${escapeHtml(u.rol)}</span></td>
          <td class="text-end text-nowrap">
            <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${u.id}">Editar</button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${u.id}"
                    ${isSelf ? 'disabled title="No puedes eliminar tu propia cuenta"' : ""}>Eliminar</button>
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
  loadUsers();
}

function onRowAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  selectedUser = usersById.get(Number(button.dataset.id));
  if (!selectedUser) return;

  if (button.dataset.action === "edit") {
    openEdit(selectedUser);
  } else {
    openDelete(selectedUser);
  }
}

function openEdit(user) {
  hideAlert(editAlert);
  clearFieldErrors(editForm);
  editForm.elements["nombres"].value = user.nombres;
  editForm.elements["apellidos"].value = user.apellidos;
  editForm.elements["email"].value = user.email;
  editModal.show();
}

async function onEditSubmit(event) {
  event.preventDefault();
  hideAlert(editAlert);
  clearFieldErrors(editForm);

  const button = document.getElementById("btn-edit-save");
  setLoading(button, true, "Guardando...");

  try {
    const updated = await updateUser(selectedUser.id, {
      nombres: editForm.elements["nombres"].value.trim(),
      apellidos: editForm.elements["apellidos"].value.trim(),
      email: editForm.elements["email"].value.trim(),
    });

    // Si el admin cambió su propio email, su token deja de ser válido.
    if (selectedUser.email === session.email && updated.email !== session.email) {
      logout("?emailChanged=1");
      return;
    }

    editModal.hide();
    showToast("Se ha editado el usuario.");
    loadUsers();
  } catch (error) {
    if (!showFieldErrors(editForm, error.data)) {
      showAlert(editAlert, error.message);
    }
  } finally {
    setLoading(button, false);
  }
}

function openDelete(user) {
  hideAlert(deleteAlert);
  document.getElementById("delete-name").textContent =
    `${user.nombres} ${user.apellidos} (${user.email})`;
  deleteModal.show();
}

async function onDeleteConfirm(event) {
  const button = event.currentTarget;
  hideAlert(deleteAlert);
  setLoading(button, true, "Eliminando...");

  try {
    await deleteUser(selectedUser.id);

    // Si era el único de la última página, retrocede una.
    if (usersById.size === 1 && state.page > 0) state.page--;

    deleteModal.hide();
    showToast("Se ha eliminado el usuario.");
    loadUsers();
  } catch (error) {
    showAlert(deleteAlert, error.message);
  } finally {
    setLoading(button, false);
  }
}
