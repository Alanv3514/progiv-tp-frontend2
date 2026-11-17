# TP2 Frontend — Programación IV (UTN TUP 2026)

Frontend en React + TypeScript (Vite) que consume la API de clase `clase-1-sqlmodel` (FastAPI + SQLModel + JWT, usuarios/roles/permisos). El repo trae las dos partes:

```
.
├── frontend/            el TP: React + TypeScript + Vite
├── backend/             copia de la API de clase clase-1-sqlmodel (no se modifica)
├── docker-compose.yml   levanta backend/ sin instalar Python
└── docs/                enunciado y guía de la materia
```

- Enunciado: [`docs/practica-bk-endpoints.pdf`](docs/practica-bk-endpoints.pdf) — 9 prácticas sobre la base de los pasos 1 a 7 de la guía.
- Guía de la materia: [`docs/guia-react-frontend.pdf`](docs/guia-react-frontend.pdf).
- `backend/` es una copia de `clase-1-sqlmodel` del repo de clase `utn-tup-2026-python` (commit `73005c1`), sin `.venv` ni `database.db`. Su documentación está en [`backend/README.md`](backend/README.md).

> Este front **no** funciona con la API del TP1 (ABM en memoria): necesita el login con JWT, los roles y los endpoints de `clase-1-sqlmodel`.

## Requisitos

- Node.js 20+ y npm
- Docker (recomendado) o Python 3.12+ para la API

## Cómo correrlo

1. Levantar la API en `http://localhost:8000`.

   **Opción A — con Docker (sin instalar Python).** Desde la raíz del repo:

   ```powershell
   docker compose up -d --wait
   ```

   [`docker-compose.yml`](docker-compose.yml) monta `backend/` en solo lectura, instala las dependencias dentro del contenedor y levanta `uvicorn` en el puerto 8000. No crea `.venv` ni `database.db` en el repo, y cada arranque empieza con la base limpia (los usuarios de prueba).

   ```powershell
   docker compose logs -f api   # ver la terminal de uvicorn (los 500 aparecen acá)
   docker compose down          # apagarla
   ```

   **Opción B — con Python** (en Windows):

   ```powershell
   cd backend
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

2. Levantar el front:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

3. Abrir <http://localhost:5174> (usar `localhost`, no `127.0.0.1`). En el login hay botones para entrar con los usuarios de prueba.

La URL de la API está en `frontend/.env.development` (`VITE_API_URL`).

### Usuarios de prueba (contraseña `123`)

| Email | Rol | Permisos |
|---|---|---|
| `mgomez@email.com` | ADMIN | `write_users`, `read_users`, `delete_users`, `update_users` |
| `sfer@email.com` | REGULAR | `read_users` |

## Scripts (desde `frontend/`)

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

Conteo sobre el código con las prácticas 1 a 8 hechas (`frontend/src/`, antes del refactor):

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

## Después de las prácticas: refactor al paso 8

Con la práctica 9 respondida, el código se pasó a la estructura del paso 8 de la guía, sin cambiar lo que hace la app:

```
frontend/src/
├── api/
│   ├── client.ts     apiFetch: URL base, token, response.ok, detail, 401 (un solo lugar)
│   ├── auth.ts       login
│   ├── users.ts      getUsers, getUser, getMe, searchUsers, getAdults, createUser, deleteUser
│   └── types.ts      tipos de lo que viaja por HTTP
├── hooks/
│   └── useFetch.ts   loading / error / data (+ setData para alta y borrado sin volver a pedir)
├── components/       CreateUserForm, SearchForm, UserDetail, UserRow (vista)
├── pages/            LoginPage, UsersPage
├── utils/            formatRoles, ListView (todos / búsqueda / mayores)
└── App.tsx           sesión: token, Salir y qué hacer ante un 401
```

El mismo conteo de la práctica 9, después del refactor:

| Qué | Antes | Después |
|---|---|---|
| `import.meta.env.VITE_API_URL` | 6 en 4 archivos | 1, en `api/client.ts` |
| ``Authorization: `Bearer ${token}` `` | 5 en 3 archivos | 1, en `api/client.ts` |
| `if (!response.ok)` | 7 en 4 archivos | 1, en `api/client.ts` |
| `status === 401` | 6 en 3 archivos | 1, en `api/client.ts` |
| `useState` de loading/error para pedidos `GET` | 3 componentes | 1 hook (`useFetch`) |
| Prop `onUnauthorized` | `App` → `UserList` → `UserDetail` / `CreateUserForm` | ninguna: `App` registra el manejador con `setUnauthorizedHandler` |

Cambiar el header del token ahora es **1 archivo y 1 línea**. Quedan `useState` de error propios solo en las acciones que no son un `GET` al montar (login, alta y borrado), porque su error se muestra junto al formulario o al botón.
