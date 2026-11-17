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
| 9 | Para pensar: código repetido | — | ✅ |

## Respuestas a los "Para pensar"

### Práctica 1: ¿por qué la lista no trae todos los datos?

`GET /user` devuelve solo `id` y `name` porque es lo único que necesita la lista. Si trajera email, edad, país y roles de cada usuario, con 10.000 usuarios la respuesta sería enorme: la base tendría que resolver los joins con países y roles para todos, viajarían muchos más datos por la red y el navegador tendría que guardarlos, aunque el usuario mire el detalle de uno o dos. Pedir el detalle con `GET /user/{id}` solo al hacer clic cuesta un pedido más, pero es chico y se hace únicamente cuando hace falta. Además, la API expone lo mínimo indispensable (por ejemplo, no reparte los emails de todos).

### Práctica 7: ¿está bien que el botón Borrar aparezca igual?

No del todo. Con `sfer` el botón aparece, se confirma y recién ahí la API responde `403 Missing permission: delete_users`: el usuario descubre que no podía hacerlo después de intentarlo. Lo correcto es que el front sepa qué permisos tiene el usuario logueado y oculte (o deshabilite) lo que no puede hacer. Igual, ocultar el botón es solo una mejora de la experiencia: la seguridad la sigue dando la API, que es la que rechaza el pedido; desde el front cualquiera puede mandar el `DELETE` a mano. La guía lo resuelve en el paso 12.

### Práctica 9: código repetido (antes del paso 8)

Conteo sobre el código con las prácticas 1 a 8 hechas (`src/`):

| Qué | Veces | Archivos |
|---|---|---|
| `import.meta.env.VITE_API_URL` | 6 | 4 (`App`, `CreateUserForm`, `UserDetail`, `UserList` ×3) |
| ``Authorization: `Bearer ${token}` `` | 5 (lo usan 6 pedidos) | 3 (`CreateUserForm`, `UserDetail`, `UserList` ×3) |
| `if (!response.ok)` | 7 | 4 (`App`, `CreateUserForm`, `UserDetail`, `UserList` ×4) |
| `useState` para loading y error | 8 (3 de carga: `loading`, `sending`, `deletingId`; 5 de error) | 4 |

Y aparecieron más repeticiones que el enunciado no lista:

- `if (response.status === 401) return onUnauthorized()`: 6 veces en 3 archivos (práctica 8).
- `'No se pudo conectar con la API'` en un `catch`: 4 veces en 3 archivos.
- La prop `onUnauthorized` pasa de `App` a `UserList` y de ahí a `UserDetail` y `CreateUserForm`, que no la usan para nada propio: solo para avisar hacia arriba (*prop drilling*).

**Si el backend cambia el header del token**, hay que tocar **3 archivos y 5 lugares**. Lo peor no es el trabajo sino olvidarse de uno: TypeScript no lo detecta (es un string), el build pasa y la app anda. Ese pedido sale sin el token donde la API lo espera y la API lo rechaza. Si responde 401, por la práctica 8 el usuario es expulsado con *Tu sesión venció* justo al usar esa función (por ejemplo, al borrar), aunque su sesión esté perfecta; si responde otro error, ve un mensaje que no explica nada. En los dos casos es un bug que solo aparece en una pantalla y con un mensaje que apunta a otro lado.

Lo mismo pasa con cualquier regla transversal: cambiar la URL base, agregar un header, tratar distinto el 403 o mejorar el mensaje de error de red implica recorrer todos los `fetch` a mano.

**La solución (paso 8)** es tener un único lugar que sepa hablar con la API: una función `apiFetch` que arme la URL con `VITE_API_URL`, agregue el `Authorization`, revise `response.ok`, convierta el `detail` en un error y resuelva el 401 en un solo punto; funciones por recurso (`api/users.ts`: `getUsers`, `deleteUser`…) para que los componentes no vean URLs; y un hook `useFetch` que encapsule `loading`/`error`/`data`. Así un cambio de header se toca en **1 archivo y 1 línea**.
