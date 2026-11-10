import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

export function notifySuccess(message) {
  return Toast.fire({ icon: "success", title: message });
}

export function notifyError(message) {
  return Swal.fire({
    icon: "error",
    title: "Ha ocurrido un error",
    text: message,
  });
}

export function confirmAction({
  title,
  html,
  text,
  icon = "warning",
  confirmButtonText = "Eliminar",
}) {
  return Swal.fire({
    title,
    html,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#8c1d3a",
    cancelButtonColor: "#6c757d",
    reverseButtons: true,
  }).then((result) => result.isConfirmed);
}

export function showLoading(title = "Procesando...") {
  Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => Swal.showLoading(),
  });
}

export function closeAlert() {
  Swal.close();
}
