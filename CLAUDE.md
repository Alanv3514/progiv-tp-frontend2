# CLAUDE.md — TP2 Frontend (Programación IV)

Contexto para el agente que trabaje en este repo.

## Qué es

TP2 de frontend de Programación IV (UTN, Tecnicatura Universitaria en Programación, 2026). Un front en React + TypeScript (Vite) que consume la API de clase **`clase-1-sqlmodel`** del profesor (FastAPI + SQLModel, JWT, usuarios/roles/permisos). **No** es la API de la biblioteca del TP2 de backend.

- Enunciado: `docs/practica-bk-endpoints.pdf` ("Práctica: frontend React con lo visto hasta el paso 7").
- Guía paso a paso del profe: `docs/guia-react-frontend.pdf`. El repo arranca en el estado final del **paso 7** (login, token en `localStorage`, Salir, lista de usuarios, saludo con `GET /user/me/id` → `GET /user/{id}`).
- Código de referencia del profe (solo lectura, fuera del repo): `../../../profesor/frontend/utn-tup-2026-frontend-clase` (pasos 1–7) y `../../../profesor/frontend/utn-tup-2026-frontend` (solución completa pasos 8–13).
- API (fuera del repo): `../../../profesor/backend/utn-tup-2026-python/clase-1-sqlmodel`.

## Las 9 prácticas (resumen del enunciado)

1. **Detalle de usuario**: clic en un nombre → email, edad, país y roles. `GET /user/{id}`. Estado con el id elegido + `useEffect` que dependa de él.
2. **"Cargando..." y errores**: mientras llega la lista, "Cargando..."; si la API responde error, mostrar el `detail`. Estados `loading` y `error`, mirar `response.ok`.
3. **Buscar por nombre**: input + botón Buscar → `GET /user/search/{name}` con `encodeURIComponent(name)`. Botón Limpiar vuelve a la lista completa.
4. **Mis roles en el saludo**: "Hola, Martina (ADMIN)". `GET /user/{id}` ya trae `roles`; ampliar la interfaz `User`, `.map(...).join(', ')`.
5. **Alta de usuario**: form con nombre, edad, email, contraseña y país → `POST /user` con `{ name, age, email, password, country_id }`. País en `<select>` escrito a mano (1 Argentina, 2 Brasil). `age` y `country_id` como número (`Number(...)`). `type="email"`, `minLength={4}` en la contraseña. Al crear, actualizar la lista sin recargar. Con `sfer` (sin permiso) mostrar el mensaje de la API.
6. **Solo mayores**: botón que alterna Todos / Solo mayores → `GET /user_mayores`. Probar creando uno de 16 años con la práctica 5.
7. **Borrar usuario**: botón Borrar por fila → `DELETE /user/{id}`. Confirmar con `window.confirm(...)` y sacarlo de la lista con `filter` sin volver a pedirla. Con `sfer` la API responde `403 Missing permission: delete_users`: mostrar el mensaje.
8. **Sesión vencida**: si cualquier pedido responde 401, borrar el token y volver al login con "Tu sesión venció". El logout está en `App` y el fetch en `UserList`: pasar una prop `onUnauthorized`.
9. **Para pensar** (sin código): contar cuántas veces se repite `import.meta.env.VITE_API_URL`, `Authorization: Bearer ...`, `if (!response.ok)` y los `useState` de loading/error; ¿cuántos archivos habría que tocar si cambia el header del token? Responder en el README.

### Decisión abierta (preguntar al usuario antes de empezar)

El enunciado pide resolverlo "con lo visto hasta el paso 7" (fetch directo en cada componente), y la práctica 9 busca que se sienta la repetición. Alternativa: usar desde el inicio la capa del paso 8 (`api/client.ts` con un único `apiFetch`, `api/users.ts`, hook `useFetch`) y responder la 9 explicando por qué. Las dos cumplen; **lo decide el usuario**.

## API — lo que usa este TP

| Método y ruta | Permiso | Devuelve |
|---|---|---|
| `POST /login` | público | `{ msg, token }` (401 `{detail}` si falla) |
| `GET /user?offset&limit` | `read_users` | `[{ id, name }]` |
| `GET /user/{id}` | `read_users` | usuario con `email`, `age`, `country`, `roles` |
| `GET /user/me/id` | `read_users` | `{ id }` |
| `GET /user/search/{name}` | `read_users` | lista de usuarios |
| `GET /user_mayores` | `read_users` | lista de usuarios |
| `POST /user` | `write_users` | `{ id }` |
| `DELETE /user/{id}` | `delete_users` | `{ msg }` |

- Errores de FastAPI: `{"detail": "texto"}` en `HTTPException`; en 422 `detail` es una lista `[{loc, msg}]`.
- `fetch` no falla con 4xx/5xx: siempre mirar `response.ok`.
- Un 500 sale sin headers CORS → el navegador lo muestra como error de CORS. Mirar primero la terminal de uvicorn.
- El token vence a los 30 minutos (401).
- Usuarios de prueba, contraseña `123`: `mgomez@email.com` (ADMIN, todos los permisos) y `sfer@email.com` (REGULAR, solo `read_users`).

## Entorno

- **Windows**, PowerShell. No usar WSL.
- Node 26 / npm 11. Front en `http://localhost:5174` (puerto fijo en `vite.config.ts`). Usar `localhost`, no `127.0.0.1`.
- API en `http://localhost:8000` (`VITE_API_URL` en `.env.development`). En el backend: `.venv\Scripts\activate` y `uvicorn main:app --reload --port 8000`.
- Windows PowerShell 5.1 rompe las comillas dobles dentro de argumentos a programas nativos (por ejemplo `gh pr create --title '...'`): no usar `"` en títulos de PR, o usar comillas tipográficas.

## Convenciones de trabajo

- **Una rama y un PR por práctica** (por ejemplo `feat/p01-detalle-usuario`), contra `main`. El usuario prueba y aprueba cada PR por separado.
- Commits en español, estilo conventional commits (`feat(p1): ...`, `fix: ...`).
- **No agregar a Claude como coautor**: nada de `Co-Authored-By`, `Claude-Session` ni "Generated with Claude Code" en commits ni en PRs.
- Archivos en UTF-8 sin BOM y finales de línea LF (`.editorconfig` y `.gitattributes` ya lo fuerzan). No editar código con `Set-Content`/`Out-File` de PowerShell 5.
- Antes de cada PR: `npm run build` (incluye `tsc -b`) y `npm run lint` sin errores.
- Actualizar la tabla de estado de las prácticas en `README.md`.
- El usuario prefiere separar lógica y vista (hooks / componentes / páginas), SOLID y código limpio, sin romper lo que pide cada práctica.
