# Cambios del 27/10/2026

Resumen de lo que se ha cambiado en esta sesión, por qué, qué hay que hacer después de hacer pull y qué queda para cerrar la fase 1 (entrega el 1 de noviembre).

## 1. Cambios realizados

### Arranque y HTTPS

- **El registro fallaba con "Error al registrar el usuario"** porque Angular se arrancaba sin el proxy. La petición `/api/user` llegaba al propio servidor de Angular, que respondía 404 en HTML. Ahora el proxy está configurado en `client/angular.json` y se usa siempre.
- **Angular también va por HTTPS** (`https://localhost:4200`). Antes, del navegador a Angular iba por HTTP sin cifrar. Usa el mismo certificado que el backend, y así coincide con el origen que ya esperaba CORS en `server/app.ts`.
- **El certificado se genera solo.** Lo hace `scripts/generate-certs.js` con la librería `selfsigned`. Se ejecuta automáticamente antes de `npm start`, en la raíz y en `client/`, y solo crea uno nuevo si no existe, si caduca en menos de 7 días o si la clave no corresponde al certificado. Ya no hace falta OpenSSL.
- **`npm run trust-cert`** importa el certificado en el almacén de confianza de Windows para que el navegador no muestre el aviso. Pide confirmación.
- **`server/certs/` entera está en `.gitignore`.** Cada uno genera su propio certificado.
- **README** reducido a los comandos en orden.
- **Al crear una transacción**, la app navegaba a `/transaction-list`, una ruta que no existe. Ahora va a `/transactions`.

### Paso 1 de la fase 1: claves RSA por usuario y K_enc

- **En el registro**, el navegador genera un par de claves RSA-OAEP de 2048 bits:
  - envía la clave pública K_u en claro (SPKI, base64);
  - envía la clave privada k_u cifrada con AES-256-GCM usando K_enc, junto con su IV.
- **El servidor guarda la clave privada pero no puede usarla**, porque K_enc no sale nunca del navegador.
- **En el login**, el servidor devuelve la clave privada cifrada. El navegador la descifra con K_enc y la guarda en memoria como no exportable.
- **Si la contraseña es incorrecta** o alguien modifica la clave cifrada, el descifrado falla. AES-GCM autentica el contenido.

### Enumeración de usuarios corregida

- **`/salt`:** si el email no existe, devuelve una sal falsa, HMAC-SHA256(secreto_servidor, email). Siempre es la misma para ese email y tiene el mismo formato que una real.
- **`/login`:** responde "Credenciales incorrectas" tanto si el usuario no existe como si la contraseña está mal. Si no existe, verifica contra un hash ficticio para que el tiempo de respuesta sea el mismo.

### Otros arreglos

- **Ficheros de datos vacíos:** si `users.json` o `transactions.json` estaban vacíos (0 bytes), el servidor fallaba al leerlos. Ahora se tratan como una lista vacía.
- **Validación del registro:** `/user` valida el formato de cada campo (longitud de la sal, de K_auth, del IV, base64 de las claves y teléfono de 9 dígitos).
- **Emails en minúsculas:** se guardan así y se comparan así.
- **Respuestas sin datos sensibles:** pasan por `toPublicUser` y nunca incluyen el hash ni las claves por error.

### Comprobado

Hemos probado este flujo: registro, sal, login, descifrado de k_u, cifrado y descifrado con RSA, contraseña incorrecta, email inexistente, registro duplicado y registro incompleto. Todo responde como se espera. Falta probarlo desde el navegador en Windows.

## 2. Cambios de nombres y su significado

| Antes | Ahora | Qué es realmente |
|---|---|---|
| `password` en el cuerpo de `/user` y `/login` | `kAuth` | No es la contraseña. Es K_auth: los primeros 32 bytes de Argon2id(contraseña, sal), en hex. El servidor nunca recibe la contraseña. |
| `kEnc: Uint8Array` | `kEnc: CryptoKey` | K_enc: los últimos 32 bytes de Argon2id(contraseña, sal), importados como clave AES-256-GCM no exportable. Solo sirve para cifrar y descifrar k_u y nunca sale del navegador. |
| — | `publicKey` | K_u: clave pública RSA-OAEP 2048 del usuario, SPKI en base64. Pública. |
| — | `encryptedPrivateKey` | E^{AES-256-GCM}_{K_enc}(k_u): clave privada PKCS#8 cifrada, en base64. |
| — | `privateKeyIv` | IV aleatorio de 12 bytes usado para cifrar k_u, en base64. |
| `password` en `users.json` | (mismo nombre) | Hash Argon2id de K_auth, calculado en el servidor con su propia sal interna. Es un hash, no un cifrado. |
| `salt` en `users.json` | (mismo nombre) | s: sal de 16 bytes del usuario, en hex. Es pública: el cliente la pide para volver a derivar K_auth y K_enc. |
| `telephone: number` en el modelo | `telephone: string` | Ya se guardaba como texto; ahora el tipo coincide. |
| respuesta de `/login`: `{ message, user }` | `{ user, keys }` | `user` son los datos públicos (incluye `id`); `keys` contiene `publicKey`, `encryptedPrivateKey` y `privateKeyIv`. |

## 3. Ficheros nuevos y cómo se relacionan

### Servidor

```
controllers/user.controller.ts ──> services/user.service.ts ──> repositories/json/user.repository.ts ──> json-file.ts ──> data/users.json
        │                                   └──> services/encryption.service.ts (Argon2id)
        └──> mappers/user.mapper.ts (toPublicUser)

controllers/login.controller.ts ──> services/login.service.ts ──> services/user.service.ts
        │                                   ├──> services/encryption.service.ts (verify, hash ficticio, HMAC)
        │                                   └──> repositories/secret.repository.ts ──> secrets/fake-salt.key
        └──> mappers/user.mapper.ts
```

- **`repositories/json/json-file.ts`** (nuevo): lee y escribe los JSON. Lo usan los dos repositorios.
- **`repositories/secret.repository.ts`** (nuevo): secretos propios del servidor, guardados en `server/secrets/` (no se suben a git).
- **`mappers/user.mapper.ts`** (nuevo): convierte un `User` en `PublicUser` para responder al cliente.
- **`model/user.model.ts`**: añade `NewUserData` (lo que llega en el registro) y `PublicUser` (lo que se devuelve).

### Cliente

```
pages/register ──┐
                 ├──> services/crypto.service.ts ──> services/encoding.ts
pages/login ─────┤            (Argon2id, RSA-OAEP, AES-GCM)    (hex / base64)
                 └──> services/key-store.service.ts  (solo login: guarda K_enc, k_u y K_u en memoria)

models/auth.model.ts: tipos de petición/respuesta usados por register y login
```

- **`services/encoding.ts`** (nuevo): conversiones a hex y base64. Antes estaban dentro de `crypto.service.ts`.
- **`services/key-store.service.ts`** (nuevo): servicio Angular único para toda la app. Las demás páginas lo inyectarán cuando necesiten las claves (transacciones cifradas).
- **`models/auth.model.ts`** (nuevo): `RegisterRequest`, `LoginResponse`, `SaltResponse` y `PublicUser`.

### Raíz

- **`scripts/generate-certs.js`** (nuevo): genera `server/certs/server.key` y `server.crt`.
- **`scripts/trust-cert.ps1`** (nuevo): importa el certificado en Windows.

## 4. Después de hacer pull

1. **`npm install` en la raíz.** Hay una dependencia nueva, `selfsigned`; sin ella `npm start` falla con `Cannot find module 'selfsigned'`.
2. **`npm install` en `client/`.**
3. **Certificado:**
   - Si no tenéis certificado: `npm run certs` y después `npm run trust-cert`.
   - Si ya teníais uno propio, sigue valiendo.
   - Si git os sobrescribe `server/certs/server.crt` con el de otro, ejecutad `npm run certs:force` y `npm run trust-cert` otra vez.
4. **Arrancar:** `npm run build` y `npm start` en la raíz; `npm start` en `client/`. Abrid **https://localhost:4200**, no `http://`.
5. **La base de datos está vacía (`[]`).** Los usuarios antiguos no tenían claves RSA y no sirven. Hay que registrarse de nuevo.
6. **Cualquier código que llame a `/user` o `/login`** (Postman, generador de transacciones) tiene que enviar `kAuth` en lugar de `password`, con 64 caracteres hex.
7. **Al recargar la página se pierden las claves de la sesión.** Es intencionado (no se guardan en `sessionStorage` por XSS). Por ahora no afecta porque las transacciones aún no las usan.

**Pendiente de hacer una vez por quien suba los cambios:** `git rm --cached server/certs/server.crt`, para dejar de versionar el certificado. No borra el fichero local.

**No subir:** la carpeta `Claude outputs/` (borradores locales) ni `server/secrets/`.

## 5. Qué queda para cerrar la fase 1

Requisitos del enunciado para la fase 1:

- definir los datos a proteger;
- arquitectura cliente/servidor;
- registro de administradores y usuarios;
- que cada usuario cifre y descifre sus datos con claves AES aleatorias, gestionadas con sus claves asimétricas;
- memoria y vídeo de 5 minutos como máximo, antes del 1/11 a las 23:59.

### Paso 2: sesión con token (siguiente)

- Tras el login, el servidor emite un JWT de corta duración firmado con RS256, con su propio par de claves.
- El cliente lo envía en `Authorization: Bearer` mediante un `HttpInterceptor`, y lo guarda en memoria como las claves.
- Un middleware en Express verifica el token:
  - `/transaction` deja de fiarse de `emailFrom` y usa el usuario del token. Ahora mismo cualquiera puede enviar dinero desde la cuenta de otro.
  - `/transactions` devuelve solo las transacciones del usuario, y todas si es administrador. Ahora mismo devuelve las de todos.

### Paso 3: transacciones cifradas (conocimiento cero de los datos)

- **Por cada transacción** se genera una clave AES-256-GCM aleatoria, k_t.
- **Con k_t** se cifran el concepto, la cantidad y las cuentas.
- **k_t se cifra con RSA-OAEP dos veces:** con la clave pública del emisor y con la del receptor.
- **Endpoint nuevo `GET /users/public-key?telephone=`** (requiere token) para obtener la clave pública del destinatario.
- **El listado** descifra k_t con la clave privada del usuario y después los datos. Si no hay claves en memoria (por ejemplo, tras recargar la página), manda al login.
- **Número de cuenta:** cifrado con una clave aleatoria envuelta con K_u. Las transacciones referencian `userId` en lugar del número de cuenta.
- **Decisiones a justificar en la memoria:**
  - email y teléfono quedan en claro porque sirven para buscar usuarios;
  - la cantidad solo puede ir cifrada si el servidor no tiene que calcular saldos.

### Paso 4: administradores

- Crear al menos un usuario administrador (con un script de alta o un primer usuario sembrado) y que el rol se respete en el servidor.

### Memoria

- **Corregir afirmaciones:**
  - "contraseña cifrada" → "hash Argon2id de K_auth";
  - la cuenta no está cifrada todavía;
  - matizar "conocimiento cero".
- **Notación formal** con E/D, K_u/k_u, los parámetros de cada algoritmo, quién hace cada paso y los mensajes como A → B: {…}.
- **Protocolos a documentar:** registro, login (con las claves RSA y la sal falsa), TLS y certificado, sesión y transacciones.
- **Tabla de qué sabe el servidor** de cada dato, y otra de amenazas con su contramedida y su limitación.
- **Completar:** manual de usuario, sección de certificados y definición de los datos a proteger.
- **Mejoras futuras** (en un capítulo aparte): firma de claves públicas, firma de transacciones, doble factor con TOTP, autenticación por reto firmado y límite de intentos de login.

### Vídeo

- Demo de 5 minutos como máximo: registro, login, transacción y, si da tiempo, enseñar `users.json` para que se vea que el servidor solo guarda datos cifrados.
