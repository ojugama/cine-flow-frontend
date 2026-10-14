# CineFlow - Frontend Client

CineFlow Frontend es una Single Page Application (SPA) construida con Vanilla JavaScript y Bootstrap 5. Actúa como la interfaz visual principal para la administración y operación del sistema de gestión de cines, consumiendo directamente la API RESTful del backend.

## Tecnologías Principales
* **HTML5 & CSS3**
* **JavaScript (ES6+)** - Arquitectura modular basada en `import/export`.
* **Bootstrap 5.3** (Componentes de interfaz y sistema de cuadrícula).
* **Fetch API** (Comunicación asíncrona con el backend).

## Arquitectura y Estructura de Directorios
El proyecto divide el código en capas lógicas para facilitar el mantenimiento:

* **`/js/core/`**: Infraestructura global del proyecto.
  * `api/apiClient.js`: Wrapper unificado de la Fetch API. Intercepta respuestas, inyecta automáticamente el token JWT y maneja errores globales.
  * `auth/session.js`: Manejo del ciclo de vida de la sesión, decodificación de JWT almacenados en `localStorage` y control de redirecciones basadas en roles.
  * `ui/`: Controladores para renderizar la barra de navegación compartida y utilidades de alertas (`alerts.js`), modales y *spinners* de carga.
* **`/js/features/`**: Lógica específica agrupada por dominio de negocio (`auth`, `dashboard`, `funciones`, `peliculas`, `usuarios`). Cada módulo divide sus responsabilidades en `*Api.js` (peticiones directas), `*Service.js` (lógica y procesamiento) y `*View.js` (interacción con el DOM y eventos).
* **`/pages/`**: Vistas HTML organizadas por nivel de acceso (públicas, protegidas, o exclusivas del administrador).

## Características Destacadas
* **Dashboard Dinámico:** Interfaz de inicio que adapta automáticamente sus opciones y tarjetas (`renderCards`) dependiendo de si el usuario logueado posee rol `ADMIN` o `CLIENTE`.
* **Automatización de Interfaz:** Formularios inteligentes que, por ejemplo, bloquean el campo de fecha de finalización (`readonly`) en las Funciones y lo calculan de forma automática sumando la duración en minutos de la película seleccionada a la fecha de inicio.
* **Gestión de Estado Centralizada:** Sistema de paginación (`state.page`, `state.size`) manejado localmente en cada vista e inyectado como parámetros dinámicos a las peticiones del backend.
* **Seguridad Visual:** Bloqueo de botones destructivos basado en el contexto del usuario (ej. prevenir que el administrador se desactive a sí mismo desde la tabla de usuarios).

## Ejecución Local
1. Asegúrate de tener el backend de CineFlow ejecutándose en el puerto `8081`.
2. Sirve el directorio del frontend utilizando cualquier servidor local estático. Por ejemplo, con VS Code (extensión Live Server), Python o Node.js:
   ```bash
   npx serve .
