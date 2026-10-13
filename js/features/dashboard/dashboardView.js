import { requireAuth } from "../../core/auth/session.js";
import { renderNavbar } from "../../core/ui/navbar.js";
import { escapeHtml, showAlert } from "../../core/ui/alerts.js";
import { getMyProfile } from "../usuarios/usuariosService.js";

const session = requireAuth();
if (session) init(session);

async function init(session) {
  renderNavbar("dashboard");
  renderCards(session.rol === "ADMIN");

  const result = await getMyProfile();
  if (result.success) {
    document.getElementById("welcome").textContent =
      `Hola, ${result.data.nombres}`;
    document.getElementById("subtitle").textContent =
      result.data.rol === "ADMIN"
        ? "Tienes acceso de administrador."
        : "Qué bueno verte de nuevo.";
  } else {
    showAlert(document.getElementById("alert"), result.message);
  }
}

function renderCards(isAdmin) {
  const cards = [
    {
      href: "/pages/perfil.html",
      title: "Mi perfil",
      text: "Edita tus datos personales o cambia tu contraseña.",
    },
  ];

  if (isAdmin) {
    cards.push({
      href: "/pages/admin/peliculas.html",
      title: "Películas",
      text: "Administra el catálogo de películas en cartelera.",
    });
    cards.push({
      href: "/pages/admin/funciones.html",
      title: "Funciones",
      text: "Programa, consulta, edita y elimina funciones de películas.",
    });
    cards.push({
      href: "/pages/admin/usuarios.html",
      title: "Usuarios",
      text: "Consulta, edita y desactiva las cuentas registradas.",
    });
  }

  document.getElementById("cards").innerHTML = cards
    .map(
      (c) => `
      <div class="col-md-6 col-lg-4">
        <a href="${c.href}" class="card cf-card h-100 text-decoration-none text-body">
          <div class="card-body">
            <h2 class="h5 fw-bold text-primary">${escapeHtml(c.title)}</h2>
            <p class="mb-0 text-muted">${escapeHtml(c.text)}</p>
          </div>
        </a>
      </div>`,
    )
    .join("");
}
