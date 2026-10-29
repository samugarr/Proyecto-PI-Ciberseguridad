# Diagramas para la memoria

Cada diagrama está en tres formatos:

- `.png` (alta resolución) para insertarlo en el Word.
- `.svg` si se quiere escalar sin perder calidad.
- `.mmd` (código Mermaid) para editarlo. Se edita en https://mermaid.live o se regenera con `npx -p @mermaid-js/mermaid-cli mmdc -i 1-manual-usuario.mmd -o 1-manual-usuario.png -c config.json -b white -s 3`.

Reflejan el estado del proyecto al 28/10/2026. La cantidad y el concepto de las transacciones todavía van en claro, y así aparece en el diagrama 6.

## Leyenda de colores

| Color | Significado |
|---|---|
| Rojo | Secreto: nunca sale de donde se genera (navegador o servidor) |
| Amarillo | Lo guarda el servidor, pero cifrado o como hash |
| Azul | Público o en claro |
| Borde rojo discontinuo | Pendiente de proteger |

## Notación usada en los diagramas

| Símbolo | Significado |
|---|---|
| p | Contraseña del usuario |
| s | Sal del usuario (16 bytes) |
| K_auth, K_enc | Bytes 0-31 y 32-63 de Argon2id(p, s) |
| K_u / k_u | Clave pública / privada RSA del usuario |
| K_S / k_S | Clave pública / privada RSA del servidor (firma de tokens) |
| k_acc | Clave AES aleatoria que cifra el número de cuenta |
| E_AES(k, m) / D_AES(k, c) | Cifrado / descifrado AES-256-GCM con IV aleatorio de 12 bytes |
| E_RSA(K, m) / D_RSA(k, c) | Cifrado / descifrado RSA-OAEP 2048 con SHA-256 |
| h | Argon2id(K_auth) calculado por el servidor con su propia sal |
| T | Token JWT firmado con RS256 |

## Pies de figura propuestos

1. **Manual de usuario.** Flujo de uso de la aplicación: registro, inicio de sesión, consulta de transacciones enviadas y recibidas, y envío de una nueva transacción. La sesión se cierra al salir, al recargar la página o a las 8 horas del login.
2. **Claves asimétricas.** Pares RSA del sistema. El par del usuario se genera en el navegador: K_u cifra las claves aleatorias que protegen sus datos, y k_u solo se guarda cifrada con K_enc. El par del servidor firma los tokens de sesión. El certificado TLS cifra el canal.
3. **Sal y derivación de claves.** De la contraseña y la sal se obtienen con Argon2id dos claves independientes. K_auth sirve para autenticarse y el servidor solo guarda su hash. K_enc nunca sale del navegador.
4. **Registro.** Operaciones que hace el navegador antes de enviar los datos, y lo que guarda el servidor. Ni la contraseña, ni K_enc, ni k_u en claro, ni el número de cuenta llegan al servidor.
5. **Login y sesión.** Obtención de la sal, autenticación con K_auth, emisión del token firmado, descifrado de k_u y de la cuenta en el navegador, peticiones autenticadas y renovación del token.
6. **Qué sabe el servidor.** Clasificación de cada dato según se quede en el navegador, llegue cifrado, llegue solo como hash o llegue en claro porque el servidor lo necesita para funcionar.
