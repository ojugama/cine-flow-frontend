import {
  getUsuarios,
  updateUsuario,
  desactivateUsuario,
} from "./usuarioService.js";

const tbody = document.getElementById("usuarios-tbody");
const alertMessage = document.getElementById("alert-message");

const formEdit = document.getElementById("edit-usuario-form");
const edidNombresInput = document.getElementById("edit-nombres");
const editApellidosInput = document.getElementById("edit-apellidos");
const editEmailInput = document.getElementById("edit-email");
const btnSaveEdit = document.getElementById("btn-save-edit");

let modalEdit;
let usuariosLocales = [];
let idUsuarioEditando = null;

document.addEventListener("DOMContentLoaded", async () => {
  modalEdit = new bootstrap.Modal(document.getElementById("editUsuarioModal"));
  await loadTable();
});

async function loadTable() {
  tbody.innerHTML =
    "<tr><td colspan='7' class='text-center text-muted'>Cargando usuarios...</td></tr>";

  const result = await getUsuarios();

  if (result.success) {
    usuariosLocales = result.data;
    renderizarFilas(usuariosLocales);
  } else {
    mostrarAlerta(result.message, "danger");
    tbody.innerHTML =
      "<tr><td colspan='7' class='text-center text-danger'>Error al cargar los usuarios.</td></tr>";
  }
}

function renderizarFilas(usuarios) {
  tbody.innerHTML = "";

  if (usuarios.length === 0) {
    tbody.innerHTML =
      "<tr><td colspan='7' class='text-center text-muted'>No hay usuarios registrados.</td></tr>";
    return;
  }

  usuarios.forEach((usuario) => {
    const tr = document.createElement("tr");

    const estadoBadge = usuario.isActivo
      ? '<span class="badge bg-success">Activo</span>'
      : '<span class="badge bg-danger">Inactivo</span>';

    const btnDesactivar =
      usuario.isActivo && usuario.rol !== "ADMIN"
        ? `<button class="btn btn-sm btn-outline-danger btn-desactivar ms-1" data-id="${usuario.id}">Desactivar</button>`
        : "";

    tr.innerHTML = `
        <td class="fw-bold">${usuario.id}</td>
        <td>${usuario.nombres}</td>
        <td>${usuario.apellidos}</td>
        <td>${usuario.email}</td>
        <td><span class="badge bg-secondary">${usuario.rol}</span></td>
        <td>${estadoBadge}</td>
        <td class="text-center">
            <button class="btn btn-sm btn-outline-primary btn-editar" data-id="${usuario.id}">Editar</button>
            ${btnDesactivar}
        </td>
        `;

    tbody.appendChild(tr);
  });

  asignarEventosBotones();
}

function asignarEventosBotones() {
  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.target.getAttribute("data-id"));
      abrirModalEdicion(id);
    });
  });

  document.querySelectorAll(".btn-desactivar").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = parseInt(e.target.getAttribute("data-id"));
      await confirmarDesactivacion(id);
    });
  });
}

function abrirModalEdicion(id) {
  const usuario = usuariosLocales.find((u) => u.id === id);

  if (!usuario) return;

  idUsuarioEditando = id;

  edidNombresInput.value = usuario.nombres;
  editApellidosInput.value = usuario.apellidos;
  editEmailInput.value = usuario.email;

  modalEdit.show();
}

formEdit.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!idUsuarioEditando) return;

  const originalText = btnSaveEdit.innerText;
  btnSaveEdit.innerText = "Guardando...";
  btnSaveEdit.disabled = true;

  const userData = {
    nombres: edidNombresInput.value.trim(),
    apellidos: editApellidosInput.value.trim(),
    email: editEmailInput.value.trim(),
  };

  const result = await updateUsuario(idUsuarioEditando, userData);

  btnSaveEdit.innerText = originalText;
  btnSaveEdit.disabled = false;

  if (result.success) {
    modalEdit.hide();
    idUsuarioEditando = null;
    mostrarAlerta("Usuario actualizado correctamente.", "success");
    await loadTable();
  } else {
    alert("Ha ocurrido un error al editar el usuario: " + result.message);
  }
});

async function confirmarDesactivacion(id) {
  const confirmar = confirm(
    "¿Estás seguro de que deseas desactivar este usuario?",
  );

  if (confirmar) {
    const result = await desactivateUsuario(id);

    if (result.success) {
      mostrarAlerta("Usuario desactivado correctamente.", "success");
      await loadTable();
    } else {
      alert("Ha ocurrido un error al desactivar el usuario: " + result.message);
    }
  }
}

function mostrarAlerta(mensaje, tipo) {
  alertMessage.innerText = mensaje;
  alertMessage.className = `alert alert-${tipo}`;
  alertMessage.classList.remove("d-none");

  setTimeout(() => {
    alertMessage.classList.add("d-none");
  }, 4000);
}
