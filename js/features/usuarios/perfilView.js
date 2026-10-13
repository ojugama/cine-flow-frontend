import { logout, requireAuth } from "../../core/auth/session.js";
import { renderNavbar } from "../../core/ui/navbar.js";
import {
  clearFieldErrors,
  hideAlert,
  setLoading,
  showAlert,
  showFieldErrors,
  showToast,
} from "../../core/ui/alerts.js";
import {
  getMyProfile,
  updateMyProfile,
  updateMyPassword,
  deleteMyProfile,
} from "./usuarioService.js";

const profileForm = document.getElementById("profile-form");
const passwordForm = document.getElementById("password-form");
const profileAlert = document.getElementById("profile-alert");
const passwordAlert = document.getElementById("password-alert");
const deleteAlert = document.getElementById("delete-alert");

const btnDeleteAccount = document.getElementById("btn-delete-account");
const btnDeleteConfirm = document.getElementById("btn-delete-confirm");
const deleteModal = new bootstrap.Modal(
  document.getElementById("delete-modal"),
);

const session = requireAuth();
if (session) init();

async function init() {
  renderNavbar("profile");

  const result = await getMyProfile();

  if (result.success) {
    profileForm.elements["nombres"].value = result.data.nombres;
    profileForm.elements["apellidos"].value = result.data.apellidos;
    profileForm.elements["email"].value = result.data.email;
  } else {
    showAlert(
      profileAlert,
      result.message || "Ha ocurrido un error al cargar el perfil.",
    );
  }

  profileForm.addEventListener("submit", onProfileSubmit);
  passwordForm.addEventListener("submit", onPasswordSubmit);
  btnDeleteAccount?.addEventListener("click", openDeleteModal);
  btnDeleteConfirm?.addEventListener("click", onDeleteConfirm);
}

async function onProfileSubmit(event) {
  event.preventDefault();
  hideAlert(profileAlert);
  clearFieldErrors(profileForm);

  const button = document.getElementById("btn-profile");
  setLoading(button, true, "Guardando...");

  const userData = {
    nombres: profileForm.elements["nombres"].value.trim(),
    apellidos: profileForm.elements["apellidos"].value.trim(),
    email: profileForm.elements["email"].value.trim(),
  };

  const result = await updateMyProfile(userData);
  setLoading(button, false);

  if (result.success) {
    renderNavbar("profile");
    showToast("Datos actualizados correctamente.");
  } else {
    if (!showFieldErrors(profileForm, result.errors)) {
      showAlert(profileAlert, result.message);
    }
  }
}

async function onPasswordSubmit(event) {
  event.preventDefault();
  hideAlert(passwordAlert);
  clearFieldErrors(passwordForm);

  const currentPassword = passwordForm.elements["currentPassword"].value;
  const newPassword = passwordForm.elements["newPassword"].value;
  const confirmPassword = passwordForm.elements["confirmPassword"].value;

  if (!newPassword) {
    passwordForm.elements["newPassword"].classList.add("is-invalid");
    showAlert(passwordAlert, "La contraseña nueva es obligatoria.");
    return;
  }

  if (newPassword !== confirmPassword) {
    passwordForm.elements["confirmPassword"].classList.add("is-invalid");
    showAlert(passwordAlert, "Las contraseñas nuevas no coinciden.");
    return;
  }

  const button = document.getElementById("btn-password");
  setLoading(button, true, "Actualizando contraseña...");

  const result = await updateMyPassword({
    currentPassword,
    newPassword,
  });

  setLoading(button, false);

  if (result.success) {
    passwordForm.reset();
    showToast("Contraseña actualizada correctamente.");
  } else {
    if (!showFieldErrors(passwordForm, result.errors)) {
      showAlert(passwordAlert, result.message);
    }
  }
}

function openDeleteModal() {
  hideAlert(deleteAlert);
  deleteModal.show();
}

async function onDeleteConfirm(event) {
  const button = event.currentTarget;
  hideAlert(deleteAlert);
  setLoading(button, true, "Eliminando...");

  const result = await deleteMyProfile();

  if (result.success) {
    deleteModal.hide();
    logout();
  } else {
    setLoading(button, false);
    showAlert(
      deleteAlert,
      result.message || "Hubo un error al eliminar tu cuenta.",
    );
  }
}
