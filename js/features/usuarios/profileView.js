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
import { getMe, updateMe, updateMyPassword } from "./usuariosService.js";

const profileForm = document.getElementById("profile-form");
const passwordForm = document.getElementById("password-form");
const profileAlert = document.getElementById("profile-alert");
const passwordAlert = document.getElementById("password-alert");

const session = requireAuth();
if (session) init(session);

async function init(session) {
  renderNavbar("profile");

  try {
    const me = await getMe();
    profileForm.elements["nombres"].value = me.nombres;
    profileForm.elements["apellidos"].value = me.apellidos;
    profileForm.elements["email"].value = me.email;
  } catch (error) {
    showAlert(profileAlert, error.message);
  }

  profileForm.addEventListener("submit", (e) => onProfileSubmit(e, session));
  passwordForm.addEventListener("submit", onPasswordSubmit);
}

async function onProfileSubmit(event, session) {
  event.preventDefault();
  hideAlert(profileAlert);
  clearFieldErrors(profileForm);

  const button = document.getElementById("btn-profile");
  setLoading(button, true, "Guardando...");

  try {
    const updated = await updateMe({
      nombres: profileForm.elements["nombres"].value.trim(),
      apellidos: profileForm.elements["apellidos"].value.trim(),
      email: profileForm.elements["email"].value.trim(),
    });

    // El JWT lleva el email como "subject": si cambió, el token ya no sirve.
    if (updated.email !== session.email) {
      logout("?emailChanged=1");
      return;
    }

    showToast("Se han guardado tus datos.");
  } catch (error) {
    if (!showFieldErrors(profileForm, error.data)) {
      showAlert(profileAlert, error.message);
    }
  } finally {
    setLoading(button, false);
  }
}

async function onPasswordSubmit(event) {
  event.preventDefault();
  hideAlert(passwordAlert);
  clearFieldErrors(passwordForm);

  const currentPassword = passwordForm.elements["currentPassword"].value;
  const newPassword = passwordForm.elements["newPassword"].value;
  const confirm = passwordForm.elements["confirmPassword"].value;

  if (newPassword.length < 8) {
    passwordForm.elements["newPassword"].classList.add("is-invalid");
    showAlert(passwordAlert, "La contraseña nueva debe tener al menos 8 caracteres.");
    return;
  }
  if (newPassword !== confirm) {
    passwordForm.elements["confirmPassword"].classList.add("is-invalid");
    showAlert(passwordAlert, "Las contraseñas nuevas no coinciden.");
    return;
  }

  const button = document.getElementById("btn-password");
  setLoading(button, true, "Cambiando...");

  try {
    await updateMyPassword({ currentPassword, newPassword });
    passwordForm.reset();
    showToast("Se ha actualizado tu contraseña.");
  } catch (error) {
    if (!showFieldErrors(passwordForm, error.data)) {
      showAlert(passwordAlert, error.message);
    }
  } finally {
    setLoading(button, false);
  }
}
