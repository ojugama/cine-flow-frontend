import { registerUser } from "../usuarios/usuariosService.js";
import { redirectIfAuthenticated } from "../../core/auth/session.js";
import {
  clearFieldErrors,
  setLoading,
  showFieldErrors,
} from "../../core/ui/alerts.js";

const form = document.getElementById("register-form");
const errorMessage = document.getElementById("error-message");
const btnRegister = document.getElementById("btn-register");

if (!redirectIfAuthenticated()) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorMessage.classList.add("d-none");
    clearFieldErrors(form);

    const password = form.elements["password"].value;
    if (password.length < 8) {
      form.elements["password"].classList.add("is-invalid");
      errorMessage.textContent = "La contraseña debe tener al menos 8 caracteres.";
      errorMessage.classList.remove("d-none");
      return;
    }
    if (password !== form.elements["confirmPassword"].value) {
      form.elements["confirmPassword"].classList.add("is-invalid");
      errorMessage.textContent = "Las contraseñas no coinciden.";
      errorMessage.classList.remove("d-none");
      return;
    }

    setLoading(btnRegister, true, "Creando cuenta...");

    try {
      await registerUser({
        nombres: form.elements["nombres"].value.trim(),
        apellidos: form.elements["apellidos"].value.trim(),
        email: form.elements["email"].value.trim(),
        password,
      });
      window.location.href = "../../index.html?registered=1";
    } catch (error) {
      if (!showFieldErrors(form, error.data)) {
        errorMessage.textContent = error.message;
        errorMessage.classList.remove("d-none");
      }
      setLoading(btnRegister, false);
    }
  });
}
