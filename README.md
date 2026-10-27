# Proyecto Protección de la Información

* ANTES DE EMPEZAR : tener instalado node y npm

Para levantar el servidor:

npm install
npm run build
npm start


Para levantar la página de angular:

cd client/
npm install
npm start

La web funcionará en https://localhost:4200/ . Si queremos probar los endpoints por Postman, https://localhost:3000/  
Se ha generado un proxy para evitar los errores del cors al escuchar en puertos diferentes

PARA UTILIZAR LOS CERTIFICADOS EN LOCAL

1. Comprobar que tienes OpenSSL disponible. Si utilizas Git for Windows, puede usar el que viene incluido.
2. Generar tu propio certificado desde la carpeta raíz del proyecto:
New-Item -ItemType Directory -Force -Path server/certs

& "C:\Program Files\Git\usr\bin\openssl.exe" req `
  -x509 -newkey rsa:2048 -nodes `
  -keyout server/certs/server.key `
  -out server/certs/server.crt `
  -days 365 `
  -subj "/CN=localhost" `
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"


3. Confiar en su certificado local desde PowerShell:
Import-Certificate `
  -FilePath ".\server\certs\server.crt" `
  -CertStoreLocation "Cert:\CurrentUser\Root"


4. Arrancar el backend y Angular como hacéis habitualmente.

Importante: el comando para importar el certificado presupone que están en la raíz del proyecto. Cada compañero debe confiar únicamente en el certificado que ha generado localmente.