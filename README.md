# TP2 Frontend — Programación IV (UTN TUP 2026)

Frontend en React + TypeScript (Vite) que consume la API de clase `clase-1-sqlmodel` (FastAPI + JWT, usuarios/roles/permisos).

- Enunciado: [`docs/practica-bk-endpoints.pdf`](docs/practica-bk-endpoints.pdf) — 9 prácticas sobre la base de los pasos 1 a 7 de la guía.
- Guía de la materia: [`docs/guia-react-frontend.pdf`](docs/guia-react-frontend.pdf).

## Requisitos

- Node.js 20+ y npm
- La API `clase-1-sqlmodel` corriendo en `http://localhost:8000`

## Cómo correrlo

1. Levantar la API (desde `clase-1-sqlmodel/`, en Windows):

   ```powershell
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

2. Levantar el front:

   ```powershell
   npm install
   npm run dev
   ```

3. Abrir <http://localhost:5174> (usar `localhost`, no `127.0.0.1`).

La URL de la API está en `.env.development` (`VITE_API_URL`).

### Usuarios de prueba (contraseña `123`)

| Email | Rol | Permisos |
|---|---|---|
| `mgomez@email.com` | ADMIN | `write_users`, `read_users`, `delete_users`, `update_users` |
| `sfer@email.com` | REGULAR | `read_users` |

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en el puerto 5174 |
| `npm run build` | Chequeo de tipos (`tsc -b`) + build de producción |
| `npm run lint` | Lint con oxlint |
| `npm run preview` | Sirve el build |

## Prácticas

| # | Práctica | Endpoint | Estado |
|---|---|---|---|
| 1 | Ver el detalle de un usuario | `GET /user/{id}` | ✅ |
| 2 | "Cargando..." y errores | `GET /user` | ✅ |
| 3 | Buscar por nombre | `GET /user/search/{name}` | ✅ |
| 4 | Mostrar mis roles en el saludo | `GET /user/{id}` | ✅ |
| 5 | Alta de usuario | `POST /user` | ✅ |
| 6 | Solo mayores de edad | `GET /user_mayores` | ✅ |
| 7 | Borrar un usuario | `DELETE /user/{id}` | ✅ |
| 8 | Sesión vencida (401 → login) | todos | ✅ |
| 9 | Para pensar: código repetido | — | ⬜ |

## Respuestas a los "Para pensar"

### Práctica 1: ¿por qué la lista no trae todos los datos?

`GET /user` devuelve solo `id` y `name` porque es lo único que necesita la lista. Si trajera email, edad, país y roles de cada usuario, con 10.000 usuarios la respuesta sería enorme: la base tendría que resolver los joins con países y roles para todos, viajarían muchos más datos por la red y el navegador tendría que guardarlos, aunque el usuario mire el detalle de uno o dos. Pedir el detalle con `GET /user/{id}` solo al hacer clic cuesta un pedido más, pero es chico y se hace únicamente cuando hace falta. Además, la API expone lo mínimo indispensable (por ejemplo, no reparte los emails de todos).

### Práctica 7: ¿está bien que el botón Borrar aparezca igual?

No del todo. Con `sfer` el botón aparece, se confirma y recién ahí la API responde `403 Missing permission: delete_users`: el usuario descubre que no podía hacerlo después de intentarlo. Lo correcto es que el front sepa qué permisos tiene el usuario logueado y oculte (o deshabilite) lo que no puede hacer. Igual, ocultar el botón es solo una mejora de la experiencia: la seguridad la sigue dando la API, que es la que rechaza el pedido; desde el front cualquiera puede mandar el `DELETE` a mano. La guía lo resuelve en el paso 12.
