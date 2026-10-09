import { requireAuth } from "../../core/auth/session.js";
import { renderNavbar } from "../../core/ui/navbar.js";
import { escapeHtml, showAlert } from "../../core/ui/alerts.js";
import { getMe } from "../usuarios/usuariosService.js";

const session = requireAuth();
if (session) init(session);

async function init(session) {
  renderNavbar("dashboard");
  renderCards(session.rol === "ADMIN");

  try {
    const me = await getMe();
    document.getElementById("welcome").textContent = `Hola, ${me.nombres}`;
    document.getElementById("subtitle").textContent =
      me.rol === "ADMIN"
        ? "Tienes acceso de administrador."
        : "Qué bueno verte de nuevo.";
  } catch (error) {
    showAlert(document.getElementById("alert"), error.message);
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
      href: "/pages/admin/funciones.html",
      title: "Funciones",
      text: "Programa, consulta, edita y elimina funciones de películas.",
    });
    cards.push({
      href: "/pages/admin/usuarios.html",
      title: "Usuarios",
      text: "Consulta, edita y elimina las cuentas registradas.",
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
