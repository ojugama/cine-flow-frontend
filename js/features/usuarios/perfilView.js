import {
  getMyProfile,
  updateMyProfile,
  updateMyPassword,
  deleteMyProfile,
} from "./usuarioService.js";

// Referencias del DOM
const alertMessage = document.getElementById("alert-message");

const perfilForm = document.getElementById("perfil-form");
const nombresInput = document.getElementById("perfil-nombres");
const apellidosInput = document.getElementById("perfil-apellidos");
const emailInput = document.getElementById("perfil-email");
const btnSavePerfil = document.getElementById("btn-save-perfil");

const passwordForm = document.getElementById("password-form");
const currentPasswordInput = document.getElementById("current-password");
const newPasswordInput = document.getElementById("new-password");
const btnSavePassword = document.getElementById("btn-save-password");

const btnDeleteAccount = document.getElementById("btn-delete-account");

document.addEventListener("DOMContentLoaded", async () => {
  const result = await getMyProfile();
  if (result.success) {
    nombresInput.value = result.data.nombres;
    apellidosInput.value = result.data.apellidos;
    emailInput.value = result.data.email;
  } else {
    mostrarAlerta("No se pudo cargar la información del perfil.", "danger");
  }
});

perfilForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const originalText = btnSavePerfil.innerText;
  btnSavePerfil.innerText = "Guardando...";
  btnSavePerfil.disabled = true;

  const userData = {
    nombres: nombresInput.value.trim(),
    apellidos: apellidosInput.value.trim(),
    email: emailInput.value.trim(),
  };

  const result = await updateMyProfile(userData);

  btnSavePerfil.innerText = originalText;
  btnSavePerfil.disabled = false;

  if (result.success) {
    mostrarAlerta("Datos actualizados correctamente.", "success");
  } else {
    mostrarAlerta(result.message, "danger");
  }
});

passwordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const originalText = btnSavePassword.innerText;
  btnSavePassword.innerText = "Actualizando...";
  btnSavePassword.disabled = true;

  const passwordData = {
    currentPassword: currentPasswordInput.value,
    newPassword: newPasswordInput.value,
  };

  const result = await updateMyPassword(passwordData);

  btnSavePassword.innerText = originalText;
  btnSavePassword.disabled = false;

  if (result.success) {
    mostrarAlerta("Contraseña actualizada exitosamente.", "success");
    passwordForm.reset();
  } else {
    mostrarAlerta(result.message, "danger");
  }
});

btnDeleteAccount.addEventListener("click", async () => {
  const confirmar = confirm(
    "¿Estás completamente seguro de eliminar tu cuenta? Esta acción cerrará tu sesión.",
  );

  if (confirmar) {
    const result = await deleteMyProfile();

    if (result.success) {
      alert("Tu cuenta ha sido desactivada. Hasta pronto.");
      localStorage.removeItem("jwt_token");
      window.location.href = "/index.html";
    } else {
      mostrarAlerta(
        "Hubo un error al eliminar tu cuenta: " + result.message,
        "danger",
      );
    }
  }
});

function mostrarAlerta(mensaje, tipo) {
  alertMessage.innerText = mensaje;
  alertMessage.className = `alert alert-${tipo} mb-4`;
  alertMessage.classList.remove("d-none");
  window.scrollTo(0, 0);

  setTimeout(() => {
    alertMessage.classList.add("d-none");
  }, 5000);
}
