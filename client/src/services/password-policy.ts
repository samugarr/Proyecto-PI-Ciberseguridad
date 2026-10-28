// Política de contraseñas. Se comprueba en el navegador porque el servidor nunca recibe la
// contraseña, solo K_auth, así que no puede validarla. Prima la longitud sobre la complejidad,
// como recomienda NIST SP 800-63B, y evita lo más fácil de adivinar: datos personales.
const MIN_LENGTH = 10;
const MIN_PERSONAL_DATA_LENGTH = 3;

// Devuelve el motivo por el que la contraseña no es válida, o null si lo es.
export function checkPassword(password: string, personalData: string[]): string | null {
  if (password.length < MIN_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_LENGTH} caracteres`;
  }
  if (!/\p{L}/u.test(password) || !/\d/.test(password)) {
    return 'La contraseña debe combinar letras y números';
  }
  const lowerPassword = password.toLowerCase();
  const containsPersonalData = personalData
    .map(value => value.trim().toLowerCase())
    .some(value => value.length >= MIN_PERSONAL_DATA_LENGTH && lowerPassword.includes(value));
  if (containsPersonalData) {
    return 'La contraseña no puede contener tu nombre, email o teléfono';
  }
  return null;
}
