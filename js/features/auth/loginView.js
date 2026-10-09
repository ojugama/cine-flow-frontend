import { authenticateUser } from "./authService.js";
import { redirectIfAuthenticated } from "../../core/auth/session.js";
import { setLoading, showAlert } from "../../core/ui/alerts.js";

const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("error-message");
const infoMessage = document.getElementById("info-message");
const btnLogin = document.getElementById("btn-login");

if (!redirectIfAuthenticated()) {
  showInfoFromQuery();

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorMessage.classList.add("d-none");
    infoMessage.classList.add("d-none");
    setLoading(btnLogin, true);

    const credentials = {
      email: emailInput.value.trim(),
      password: passwordInput.value,
    };

    const { success, message } = await authenticateUser(credentials);

    if (success) {
      window.location.href = "pages/cliente/dashboard.html";
    } else {
      errorMessage.textContent = message;
      errorMessage.classList.remove("d-none");
      setLoading(btnLogin, false);
    }
  });
}

function showInfoFromQuery() {
  const params = new URLSearchParams(window.location.search);

  if (params.has("expired")) {
    showAlert(infoMessage, "Tu sesión expiró. Inicia sesión de nuevo.", "warning");
  } else if (params.has("registered")) {
    showAlert(infoMessage, "Cuenta creada. Ya puedes iniciar sesión.", "success");
  } else if (params.has("emailChanged")) {
    showAlert(
      infoMessage,
      "Cambiaste tu email. Inicia sesión con el nuevo para continuar.",
      "info",
    );
  }
}
