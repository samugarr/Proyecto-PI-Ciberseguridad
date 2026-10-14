# Proyecto Protección de la Información

* ANTES DE EMPEZAR : tener instalado node y npm

Para levantar el servidor:

npm install
npm run build
npm start


Para levantar la página de angular:

cd client/
npm install
npx ng serve --proxy-config proxy.conf.json

La web funcionará en http://localhost:4200/ . Si queremos probar los endpoints por Postman, http://localhost:3000/  
Se ha generado un proxy para evitar los errores del cors al escuchar en puertos diferentes