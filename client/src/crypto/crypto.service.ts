import { argon2id } from 'hash-wasm';

const ARGON2_PARAMS = {
  parallelism: 1,
  iterations: 3,
  memorySize: 65536,
  hashLength: 64,
};

export interface DerivedKeys {
  kAuth: string;      // 32 bytes en hexadecimal -> se envía al servidor para registrarse / hacer login
  kEnc: Uint8Array;   // 32 bytes -> NUNCA sale del navegador (la usaremos en el siguiente paso para cifrar)
}

// Genera una sal aleatoria de 16 bytes con el generador criptográfico del navegador.
export function generateSalt(): string {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return bytesToHex(salt);
}

// Aplica Argon2id a la contraseña con la sal del usuario y divide el resultado:
//   resultado (64 bytes) = K_auth (primeros 32) || K_enc (últimos 32)
export async function deriveKeys(password: string, saltHex: string): Promise<DerivedKeys> {
  const result = await argon2id({
    password: password,
    salt: hexToBytes(saltHex),
    ...ARGON2_PARAMS,
    outputType: 'binary',
  });

  return {
    kAuth: bytesToHex(result.slice(0, 32)),
    kEnc: result.slice(32, 64),
  };
}


// Bytes a texto y texto a Bytes
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
