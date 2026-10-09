import { getRolToken } from "../../features/auth/authService.js";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("navbar-container");
  if (!container) return;

  const rol = getRolToken();
  if (!rol) {
    window.location.href = "/index.html";
    return;
  }

  let menuItems = "";

  if (rol === "ADMIN") {
    menuItems = `
            <li class="nav-item"><a class="nav-link fw-bold" href="/pages/admin/dashboard.html">Inicio</a></li>
            <li class="nav-item"><a class="nav-link" href="/pages/admin/usuarios.html">Usuarios</a></li>
            <li class="nav-item"><a class="nav-link" href="/pages/perfil.html">Mi Perfil</a></li>
        `;
  } else {
    menuItems = `
            <li class="nav-item"><a class="nav-link fw-bold" href="/pages/cliente/dashboard.html">Inicio</a></li>
            <li class="nav-item"><a class="nav-link" href="/pages/cliente/cartelera.html">Cartelera</a></li>
            <li class="nav-item"><a class="nav-link" href="/pages/perfil.html">Mi Perfil</a></li>
        `;
  }

  container.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
            <div class="container">
                <a class="navbar-brand fw-bold" href="#">CineFlow</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        ${menuItems}
                    </ul>
                    <button class="btn btn-outline-light btn-sm" id="btn-logout">Cerrar Sesión</button>
                </div>
            </div>
        </nav>
    `;

  document.getElementById("btn-logout").addEventListener("click", () => {
    localStorage.removeItem("jwt_token");
    window.location.href = "/index.html";
  });
});
