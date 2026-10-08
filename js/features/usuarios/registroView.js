import { registerUsuario } from "./usuarioService.js";
import { authenticateUser } from "../auth/authService.js";

const registerForm = document.getElementById("register-form");
const nombresInput = document.getElementById("nombres");
const apellidosInput = document.getElementById("apellidos");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const alertMessage = document.getElementById("alert-message");
const btnRegister = document.getElementById("btn-register");

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  alertMessage.classList.add("d-none");
  alertMessage.classList.remove("alert-success", "alert-danger");
  const originalText = btnRegister.innerText;
  btnRegister.innerText = "Cargando...";
  btnRegister.disabled = true;
  const userData = {
    nombres: nombresInput.value.trim(),
    apellidos: apellidosInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value.trim(),
  };
  const result = await registerUsuario(userData);
  alertMessage.classList.remove("d-none");
  if (result.success) {
    alertMessage.classList.add("alert-success");
    alertMessage.innerText =
      "Se ha registrado correctamente. Iniciando sesión...";
    const credentials = {
      email: userData.email,
      password: userData.password,
    };
    const loginSuccess = await authenticateUser(credentials);
    if (loginSuccess) {
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);
    } else {
      alertMessage.innerText =
        "Se ha registrado correctamente. Por favor, inicie sesión manualmente.";
      setTimeout(() => {
        window.location.href = "../../index.html";
      }, 2000);
    }
  } else {
    alertMessage.classList.add("alert-danger");
    alertMessage.innerText = result.message;
    btnRegister.innerText = originalText;
    btnRegister.disabled = false;
  }
});
