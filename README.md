# CineFlow Frontend (`rama-react`)

Aplicación web en React + Vite para la gestión de cartelera, compra de boletas y combos, y administración de películas, funciones y usuarios de **CineFlow**.

## Tecnologías principales

- **React 18** + **Vite 5**
- **React Router DOM 6**
- **React Bootstrap** + **Bootstrap 5**
- **Font Awesome 7**
- **Axios** (cliente HTTP con interceptores JWT)
- **SweetAlert2** (alertas y confirmaciones)

## Requisitos previos

- **Node.js** (v18 o superior recomendado) y **npm**
- Backend de **CineFlow** (`cine-flow-backend`) corriendo en `http://localhost:8081`

## Instalación y ejecución

1. Clona el repositorio y ubícate en la rama `rama-react`:

   ```bash
   git checkout rama-react
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. *(Opcional)* Configura las variables de entorno copiando `.env.example` a `.env`:

   ```bash
   cp .env.example .env
   ```

   Por defecto, si `VITE_API_BASE_URL` no está definida, la aplicación usa `/api`, que el servidor de desarrollo de Vite redirige a `http://localhost:8081` mediante el proxy configurado en `vite.config.js`. Si prefieres apuntar directamente al backend, define:

   ```env
   VITE_API_BASE_URL=http://localhost:8081/api
   ```

4. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   El proyecto queda disponible en `http://localhost:5500` (puerto configurado en `vite.config.js` para coincidir con el CORS del backend).

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo con Vite en el puerto `5500`. |
| `npm run build` | Genera la compilación de producción en `dist/`. |
| `npm run preview` | Previsualiza la compilación de producción en el puerto `5500`. |

## Rutas y permisos por rol

La autenticación se maneja con JWT guardado en `localStorage` (`jwt_token`).

### Públicas (solo sin sesión iniciada)

- `/login` — Inicio de sesión
- `/registro` — Registro de nuevos usuarios (`CLIENTE`)

### Generales (usuarios autenticados: `CLIENTE` y `ADMIN`)

- `/dashboard` — Panel principal con accesos según el rol
- `/perfil` — Edición de datos personales, cambio de contraseña y eliminación de cuenta

### Solo `CLIENTE`

- `/cartelera` — Catálogo de películas activas con filtro por título o género
- `/comprar/:idPelicula` — Selección de función, mapa de sillas en tiempo real (`sillas-ocupadas`), selección de combos desde `/api/combos` y confirmación de compra en `/api/compras`
- `/mis-compras` — Historial de compras realizadas con código, estado de vigencia, sillas y combos

### Solo `ADMIN`

- `/admin/peliculas` — CRUD de películas
- `/admin/funciones` — Programación, edición y eliminación de funciones por sala y sucursal
- `/admin/usuarios` — Consulta, edición y desactivación de usuarios

## Estructura del proyecto

```text
src/
├── api/          # Cliente Axios (apiClient.js) e interceptores JWT/errores
├── auth/         # Contexto de autenticación y manejo de sesión
├── components/   # Layout, rutas protegidas, paginación y mapa de sillas
├── data/         # Utilidades de layout de salas y precios por formato
├── pages/        # Vistas públicas, cliente y administración
├── services/     # Módulos de consumo de la API (auth, usuarios, peliculas, funciones, combos, compras)
└── utils/        # Formateadores (moneda COP, fechas) y alertas SweetAlert2
```
