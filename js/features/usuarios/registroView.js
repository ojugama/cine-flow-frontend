import { registerUsuario } from "./usuarioService.js";
import { authenticateUser } from "../auth/authService.js";
import {
  getSession,
  redirectIfAuthenticated,
} from "../../core/auth/session.js";
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
    const confirmPassword = form.elements["confirmPassword"].value;

    if (!password) {
      form.elements["password"].classList.add("is-invalid");
      errorMessage.textContent = "La contraseña es obligatoria.";
      errorMessage.classList.remove("d-none");
      return;
    }

    if (password !== confirmPassword) {
      form.elements["confirmPassword"].classList.add("is-invalid");
      errorMessage.textContent = "Las contraseñas no coinciden.";
      errorMessage.classList.remove("d-none");
      return;
    }

    setLoading(btnRegister, true, "Creando cuenta...");

    const userData = {
      nombres: form.elements["nombres"].value.trim(),
      apellidos: form.elements["apellidos"].value.trim(),
      email: form.elements["email"].value.trim(),
      password,
    };

    const result = await registerUsuario(userData);

    if (!result.success) {
      if (!showFieldErrors(form, result.errors)) {
        errorMessage.textContent = result.message;
        errorMessage.classList.remove("d-none");
      }

      setLoading(btnRegister, false);

      return;
    }

    const authResult = await authenticateUser({
      email: userData.email,
      password: userData.password,
    });

    if (authResult.success) {
      window.location.href = "/pages/dashboard.html";
    } else {
      errorMessage.textContent = authResult.message;
      errorMessage.classList.remove("d-none");

      setLoading(btnRegister, false);
    }
  });
}
