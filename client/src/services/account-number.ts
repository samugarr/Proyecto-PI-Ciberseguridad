// Número de cuenta del usuario. Se genera en el navegador durante el registro para que el
// servidor nunca lo conozca: solo recibe la cuenta cifrada y sus 4 últimos dígitos.
const ACCOUNT_DIGITS = 22;   // ES + 22 dígitos

export function generateAccountNumber(): string {
  return 'ES' + randomDigits(ACCOUNT_DIGITS);
}

export function lastFourDigits(accountNumber: string): string {
  return accountNumber.slice(-4);
}

// Dígitos con el generador criptográfico del navegador. Se descartan los bytes >= 250 para
// que los 10 dígitos sean igual de probables (256 no es múltiplo de 10).
function randomDigits(count: number): string {
  let digits = '';
  while (digits.length < count) {
    for (const byte of crypto.getRandomValues(new Uint8Array(count))) {
      if (byte < 250 && digits.length < count) {
        digits += (byte % 10).toString();
      }
    }
  }
  return digits;
}
