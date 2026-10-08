import { authenticateUser } from "./authService.js";

const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("error-message");
const btnLogin = document.getElementById("btn-login");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorMessage.classList.add("d-none");

  const originalText = btnLogin.innerText;
  btnLogin.innerText = "Cargando...";
  btnLogin.disabled = true;

  const credentials = {
    email: emailInput.value.trim(),
    password: passwordInput.value.trim(),
  };

  const success = await authenticateUser(credentials);

  if (success) {
    window.location.href = "dashboard.html";
  } else {
    errorMessage.classList.remove("d-none");
    btnLogin.innerText = originalText;
    btnLogin.disabled = false;
  }
});
