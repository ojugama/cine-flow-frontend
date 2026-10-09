import { getSession, logout } from "../auth/session.js";
import { escapeHtml } from "./alerts.js";

export function renderNavbar(activePage) {
  const host = document.getElementById("navbar");
  const session = getSession();
  if (!host || !session) return;

  const links = [
    { id: "dashboard", href: "/pages/cliente/dashboard.html", label: "Inicio" },
    { id: "profile", href: "/pages/perfil.html", label: "Mi perfil" },
  ];
  if (session.rol === "ADMIN") {
    links.push({ id: "users", href: "/pages/admin/usuarios.html", label: "Usuarios" });
    links.push({ id: "peliculas", href: "/pages/admin/peliculas.html", label: "Películas" });
    links.push({ id: "funciones", href: "/pages/admin/funciones.html", label: "Funciones" });
  }

  const items = links
    .map(
      (l) => `
      <li class="nav-item">
        <a class="nav-link ${l.id === activePage ? "active" : ""}"
           ${l.id === activePage ? 'aria-current="page"' : ""}
           href="${l.href}">${l.label}</a>
      </li>`,
    )
    .join("");

  host.innerHTML = `
    <nav class="navbar navbar-expand-md navbar-dark cf-navbar">
      <div class="container">
        <a class="navbar-brand fw-bold" href="/pages/cliente/dashboard.html">CineFlow</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbar-content" aria-controls="navbar-content"
                aria-expanded="false" aria-label="Abrir menú">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbar-content">
          <ul class="navbar-nav me-auto mb-2 mb-md-0">${items}</ul>
          <span class="navbar-text me-md-3 mb-2 mb-md-0 small">
            ${escapeHtml(session.email)}
            <span class="badge text-bg-light ms-1">${escapeHtml(session.rol)}</span>
          </span>
          <button class="btn btn-outline-light btn-sm" id="btn-logout" type="button">
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>`;

  document.getElementById("btn-logout").addEventListener("click", () => logout());
}
