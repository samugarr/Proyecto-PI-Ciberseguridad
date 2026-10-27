# Añade el certificado local al almacén "Entidades de certificación raíz de confianza"
# del usuario actual de Windows, para que Chrome/Edge no muestren el aviso de seguridad.
# Windows pedirá confirmación en un cuadro de diálogo.
$cert = Join-Path $PSScriptRoot "..\server\certs\server.crt"
if (-not (Test-Path $cert)) {
    Write-Error "No existe server/certs/server.crt. Ejecuta antes: npm run certs"
    exit 1
}
Import-Certificate -FilePath $cert -CertStoreLocation "Cert:\CurrentUser\Root"
Write-Host "Certificado importado. Reinicia el navegador si estaba abierto."
