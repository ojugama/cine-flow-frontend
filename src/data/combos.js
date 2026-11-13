export const COMBOS = [
  {
    id: "combo-clasico",
    nombre: "Combo clásico",
    descripcion: "Crispetas medianas y una gaseosa de 16 oz.",
    precio: 22000,
    icono: "fa-bowl-food",
  },
  {
    id: "combo-pareja",
    nombre: "Combo pareja",
    descripcion: "Crispetas grandes y dos gaseosas de 16 oz.",
    precio: 35000,
    icono: "fa-heart",
  },
  {
    id: "combo-familiar",
    nombre: "Combo familiar",
    descripcion: "Crispetas jumbo, cuatro gaseosas y dos perros calientes.",
    precio: 58000,
    icono: "fa-people-group",
  },
  {
    id: "combo-nachos",
    nombre: "Combo nachos",
    descripcion: "Nachos con queso cheddar y una gaseosa de 16 oz.",
    precio: 28000,
    icono: "fa-utensils",
  },
  {
    id: "combo-dulce",
    nombre: "Combo dulce",
    descripcion: "Caja de chocolatinas surtidas y una gaseosa de 16 oz.",
    precio: 19000,
    icono: "fa-cookie-bite",
  },
  {
    id: "combo-saludable",
    nombre: "Combo saludable",
    descripcion: "Fruta picada, agua sin gas y galletas integrales.",
    precio: 20000,
    icono: "fa-apple-whole",
  },
];

export function getComboById(id) {
  return COMBOS.find((combo) => combo.id === id) ?? null;
}
