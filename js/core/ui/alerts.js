export function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}

/** Muestra un div .alert existente (o lo oculta con hideAlert). */
export function showAlert(element, message, type = "danger") {
  element.className = `alert alert-${type}`;
  element.textContent = message;
}

export function hideAlert(element) {
  element.classList.add("d-none");
}

export function setLoading(button, isLoading, loadingText = "Cargando...") {
  if (isLoading) {
    if (!button.dataset.originalHtml) {
      button.dataset.originalHtml = button.innerHTML;
    }
    button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>${escapeHtml(loadingText)}`;
    button.disabled = true;
  } else {
    if (button.dataset.originalHtml) {
      button.innerHTML = button.dataset.originalHtml;
      delete button.dataset.originalHtml;
    }
    button.disabled = false;
  }
}

export function clearFieldErrors(form) {
  form
    .querySelectorAll(".is-invalid")
    .forEach((el) => el.classList.remove("is-invalid"));
  form.querySelectorAll(".invalid-feedback[data-generated]").forEach((el) => el.remove());
}

/**
 * Marca los inputs (por atributo name) con los errores { campo: mensaje }
 * que devuelve el backend. Devuelve true si mostró al menos uno.
 */
export function showFieldErrors(form, errors) {
  if (!errors || typeof errors !== "object") return false;

  let shown = false;
  Object.entries(errors).forEach(([field, message]) => {
    const input = form.querySelector(`[name="${field}"]`);
    if (!input) return;

    input.classList.add("is-invalid");
    const feedback = document.createElement("div");
    feedback.className = "invalid-feedback";
    feedback.dataset.generated = "true";
    feedback.textContent = message;
    input.parentElement.appendChild(feedback);
    shown = true;
  });

  return shown;
}

export function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container position-fixed top-0 end-0 p-3";
    document.body.appendChild(container);
  }

  const toastEl = document.createElement("div");
  toastEl.className = `toast align-items-center text-bg-${type} border-0`;
  toastEl.setAttribute("role", "alert");
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body"></div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto"
              data-bs-dismiss="toast" aria-label="Cerrar"></button>
    </div>`;
  toastEl.querySelector(".toast-body").textContent = message;
  container.appendChild(toastEl);

  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
  new bootstrap.Toast(toastEl, { delay: 4000 }).show();
}
