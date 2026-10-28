# Registro de cambios

Entradas más recientes arriba. El detalle de la sesión del 27/10 está en `cambios-sesion-27-10.md`.

## 2026-10-28 · Token de sesión JWT, servicio de sesión único y guard de rutas

Qué: tras el login el servidor entrega un token JWT firmado con su clave privada RSA. Las rutas de transacciones lo exigen y sacan de él quién es el usuario. En el cliente, `Session` (Lucía) y `KeyStoreService` pasan a ser un único `SessionService`, y las páginas privadas tienen un guard.

Por qué:
- Antes cualquiera podía crear transacciones en nombre de otro, cambiando `emailFrom`.
- Antes cualquiera podía ver las transacciones de otro, cambiando `?userId=` en la URL.
- Tener dos servicios de sesión hacía que, tras recargar, la app pareciera tener sesión sin tener las claves. Además "Salir" no borraba las claves.

Ficheros:
- Servidor, nuevos: `middlewares/auth.middleware.ts`, `services/token.service.ts`, `model/auth.model.ts`, `types/express.d.ts`.
- Servidor, modificados: `app.ts`, `controllers/login.controller.ts`, `controllers/transaction.controller.ts`, `services/transaction.service.ts`, `model/transaction.model.ts`, `repositories/secret.repository.ts`, `package.json`.
- Cliente, nuevos: `services/session.service.ts`, `guards/auth.guard.ts`, `interceptors/auth.interceptor.ts`.
- Cliente, modificados: `app/app.ts`, `app/app.config.ts`, `app/app.routes.ts`, `models/auth.model.ts`, `pages/login`, `pages/new-transaction`, `pages/transaction-list`.
- Cliente, borrados: `app/session.ts` y `services/key-store.service.ts`.

Rompe compatibilidad: sí.
- Hay que hacer `npm install` en la raíz por la dependencia nueva `jsonwebtoken`.
- `POST /transaction` ya no acepta `emailFrom`: el emisor es el usuario del token.
- `GET /transactions` ya no usa `?userId=`.
- Las dos rutas devuelven 401 sin `Authorization: Bearer <token>`. En Postman hay que copiar el `token` de la respuesta de `/login`.
- En el cliente se usa `SessionService` (`services/session.service.ts`) en lugar de `Session` y `KeyStoreService`. El rol es `user.userType`; `role` no existía en el servidor y por eso el enlace de administración nunca aparecía.
- Ya no se guarda nada en `sessionStorage`. Al recargar la página hay que volver a iniciar sesión.

Seguridad:
- JWT RS256: el servidor firma con su clave privada RSA-2048 y verifica con la pública. El par se genera la primera vez en `server/secrets/jwt-private.pem` y `jwt-public.pem`, fuera de git.
- El token caduca a los 15 minutos e incluye `sub` (id del usuario), `role` e `iss`.
- `verify` fija el algoritmo a RS256. Se han probado y rechazado:
  - token sin firma (`alg: none`);
  - token HS256 firmado usando la clave pública como secreto;
  - token firmado con otra clave;
  - token con el payload manipulado;
  - token caducado.
- El rol que decide qué transacciones se ven se lee de la base de datos, no del token.
- Si una petición devuelve 401 con token, el cliente cierra la sesión.
- El guard y la barra de navegación solo afectan a la interfaz; el control real lo hace el servidor.

Memoria:
- Añadir el proceso "sesión":
  - S emite T = Sig^{RS256}_{k_S}({sub, role, iss, iat, exp});
  - u → S: {Authorization: Bearer T};
  - S comprueba Ver_{K_S}(T) y exp.
- Es el primer uso de criptografía asimétrica por parte del servidor, que el enunciado pide.
- En la tabla de amenazas: suplantación del emisor, acceso a datos ajenos, token robado (limitado a 15 minutos) y XSS (el token solo vive en memoria).
