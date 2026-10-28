# Registro de cambios

Entradas más recientes arriba. El detalle de la sesión del 27/10 está en `cambios-sesion-27-10.md`.

## 2026-10-28 · Número de cuenta cifrado (el servidor no lo conoce)

Qué:
- El número de cuenta lo genera el navegador en el registro y lo cifra con cifrado híbrido antes de enviarlo.
- El servidor guarda la cuenta cifrada y los 4 últimos dígitos en claro, que usa solo para la cuenta enmascarada.
- En el login, el navegador descifra la cuenta con la clave privada del usuario.

Por qué: es el primer dato protegido con claves AES aleatorias gestionadas con la clave asimétrica del usuario, que es lo que pide la fase 1. Antes el servidor generaba la cuenta y la guardaba en claro.

Ficheros:
- Servidor, nuevo: `model/crypto.model.ts` (tipos `AesGcmCiphertext` y `HybridCiphertext`).
- Servidor, modificados: `model/user.model.ts`, `mappers/user.mapper.ts`, `services/user.service.ts`, `controllers/user.controller.ts`, `controllers/login.controller.ts`.
- Cliente, nuevo: `services/account-number.ts`.
- Cliente, modificados: `services/crypto.service.ts` (`encryptHybrid` y `decryptHybrid`), `services/session.service.ts`, `models/auth.model.ts`, `pages/register/register.page.ts`, `pages/login/login.page.ts`.

Rompe compatibilidad: sí.
- Hay que vaciar `users.json` y `transactions.json` y registrarse de nuevo.
- `POST /user` exige `account: { ciphertext, iv, wrappedKey }` y `accountLast4`.
- `/login` devuelve además `account`.
- `PublicUser` ya no tiene `accountNumber`. En el cliente, `session.user.accountNumber` sigue existiendo: es la cuenta descifrada en el navegador (tipo `SessionUser`).

Seguridad:
- La cuenta se cifra con una clave AES-256-GCM aleatoria k_acc y un IV aleatorio de 12 bytes.
- k_acc se cifra con RSA-OAEP-2048-SHA256 y la clave pública K_u, y se descarta.
- Solo k_u, que el servidor guarda cifrada con K_enc, puede recuperar k_acc.
- Los dígitos se generan con `crypto.getRandomValues`, descartando los bytes 250-255 para que todos los dígitos sean igual de probables.
- Probado:
  - la cuenta no aparece en `users.json` ni en ninguna respuesta del servidor;
  - una cuenta manipulada falla al descifrar (GCM);
  - otro usuario no puede descifrarla;
  - cifrar dos veces el mismo valor da resultados distintos.
- Limitaciones:
  - el servidor no puede comprobar que `accountLast4` coincide con la cuenta cifrada, ni que no haya dos cuentas iguales (probabilidad de 1 entre 10^22 por par);
  - el cifrado no está ligado al usuario mediante datos autenticados (AAD), así que el servidor podría intercambiar la cuenta cifrada de dos usuarios. El descifrado fallaría porque cada una va con la clave pública de su dueño, pero no se detectaría antes.

Memoria:
- Proceso de registro, añadir:
  - u genera cuenta ← "ES" ‖ 22 dígitos aleatorios y k_acc ← aleatorio(32 bytes);
  - u → S: {E^{AES-256-GCM}_{k_acc}(cuenta), IV, E^{RSA-OAEP}_{K_u}(k_acc), cuenta[-4..]}.
- Proceso de login, añadir: D_{k_u}(E_{K_u}(k_acc)) = k_acc y después D_{k_acc}(…) = cuenta.
- En la tabla de qué sabe el servidor: número de cuenta → nunca en claro; 4 últimos dígitos → sí.

## 2026-10-28 · Listado con nombre, teléfono y cuenta enmascarada

Qué:
- Las transacciones guardan `senderId` y `receiverId` en lugar de cuentas y teléfonos.
- `GET /transactions` devuelve de cada parte su nombre, teléfono y cuenta enmascarada (`ES** **** **** **** **** 1234`).
- El listado muestra la otra parte de cada transacción. El administrador ve las dos.

Por qué: es el paso previo al servidor de conocimiento cero. Si la transacción no depende del número de cuenta, la cuenta se puede cifrar después sin cambiar el listado. Nadie ve la cuenta completa de otro usuario, como en Bizum.

Ficheros:
- Servidor, nuevo: `mappers/transaction.mapper.ts`.
- Servidor, modificados: `model/transaction.model.ts`, `mappers/user.mapper.ts`, `repositories/json/transaction.repository.ts`, `services/transaction.service.ts`.
- Cliente, nuevo: `models/transaction.model.ts`.
- Cliente, modificados: `pages/transaction-list` (ts, html, css).

Rompe compatibilidad: sí.
- El formato de `transactions.json` cambia: las transacciones antiguas no se muestran. Hay que vaciarlo (`[]`).
- `GET /transactions` y `POST /transaction` devuelven `{ id, sender, receiver, description, amount, date }`, con `sender` y `receiver` = `{ id, name, telephone, maskedAccount }`.

Seguridad:
- La respuesta del listado nunca incluye la cuenta completa de nadie: el servidor solo envía los 4 últimos dígitos. Probado con tres usuarios.

Otros: los estilos de las etiquetas Ingreso/Pago estaban dentro del bloque `@media` de móvil y en escritorio no se aplicaban. Se han movido fuera.

## 2026-10-28 · Renovación del token, política de contraseñas, base64 y limpieza

Qué:
- El cliente renueva el token un minuto antes de que caduque mientras la sesión sigue abierta, con un máximo de 8 horas desde el login.
- El registro exige una contraseña mínima.
- La sal y K_auth pasan de hex a base64.
- Se quitan comentarios y código comentado del listado y de la barra de navegación.

Por qué:
- Antes la sesión se cerraba a los 15 minutos aunque se estuviera usando.
- Se aceptaba cualquier contraseña. Si roban `users.json`, una contraseña débil se puede adivinar sin conexión (Argon2id para obtener K_enc y comprobar si descifra k_u).
- Había dos codificaciones para binarios.

Ficheros:
- Servidor: `app.ts`, `controllers/login.controller.ts`, `controllers/user.controller.ts`, `services/token.service.ts`, `services/login.service.ts`, `services/encryption.service.ts`, `model/auth.model.ts`, `model/user.model.ts`.
- Cliente, nuevo: `services/password-policy.ts`.
- Cliente, modificados: `services/session.service.ts`, `services/crypto.service.ts`, `services/encoding.ts`, `models/auth.model.ts`, `pages/register` (ts, html), `pages/login/login.page.css`, `pages/transaction-list` (html, css), `app/app.ts`.

Rompe compatibilidad: sí.
- Los usuarios registrados antes tienen la sal en hex y ya no pueden iniciar sesión. Hay que vaciar `users.json` y `transactions.json` (`[]`) y registrarse de nuevo.
- `kAuth` y `salt` van en base64: 44 y 24 caracteres.
- Endpoint nuevo `POST /token/refresh` (requiere token) que devuelve `{ token }`.

Seguridad:
- El token renovado conserva `auth_time` (hora del login). Si han pasado más de 8 horas, el servidor no lo renueva y hay que volver a iniciar sesión, así que un token robado no se puede alargar indefinidamente.
- Si la renovación falla, el cliente cierra la sesión.
- El servidor hashea los 32 bytes de K_auth, no su texto.
- La política de contraseñas es: 10 caracteres como mínimo, letras y números, y sin nombre, usuario del email ni teléfono. Sigue el criterio de NIST SP 800-63B (longitud antes que reglas de complejidad).
- La política solo se puede comprobar en el cliente, porque el servidor nunca ve la contraseña. Un cliente modificado podría saltársela, pero solo perjudicaría a su propia cuenta.

Memoria:
- En el proceso de sesión, añadir la renovación: u → S: {Bearer T}; S → u: T' con el mismo auth_time; límite de 8 horas.
- Explicar la política de contraseñas y por qué se valida en el cliente.
- Indicar el ataque de diccionario offline como limitación.

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
