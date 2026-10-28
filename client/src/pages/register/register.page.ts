import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { deriveKeys, encryptHybrid, encryptPrivateKey, exportPublicKey, generateRsaKeyPair, generateSalt } from '../../services/crypto.service';
import { generateAccountNumber, lastFourDigits } from '../../services/account-number';
import { checkPassword } from '../../services/password-policy';
import { RegisterRequest } from '../../models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.page.html',
  // Reutilizamos los estilos de la página de login para no duplicar CSS
  styleUrls: ['../login/login.page.css']
})
export class RegisterPage {

  name = '';
  email = '';
  telephone = '';
  password = '';
  confirmPassword = '';

  constructor(private http: HttpClient, private router: Router) {}

  async register() {
    const emailUser = this.email.split('@')[0];
    const passwordError = checkPassword(this.password, [this.name, emailUser, this.telephone]);
    if (passwordError) {
      alert(passwordError);
      return;
    }
    if (this.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const body = await this.buildRegisterRequest();
      await firstValueFrom(this.http.post('/api/user', body));
      alert('Usuario registrado correctamente. Ya puedes iniciar sesión.');
      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Error en el registro:', error);
      alert(error.error?.error ?? 'Error al registrar el usuario');
    }
  }

  // 1. s aleatoria  2. K_auth || K_enc = Argon2id(P, s)  3. par RSA (K_u, k_u)  4. E_{K_enc}(k_u)
  // 5. nº de cuenta aleatorio, cifrado con una clave AES k_acc que a su vez se cifra con K_u
  // Al servidor no llegan nunca la contraseña, K_enc ni el número de cuenta.
  private async buildRegisterRequest(): Promise<RegisterRequest> {
    const salt = generateSalt();
    const { kAuth, kEnc } = await deriveKeys(this.password, salt);
    const keyPair = await generateRsaKeyPair();
    const accountNumber = generateAccountNumber();

    return {
      name: this.name,
      email: this.email,
      telephone: this.telephone,
      kAuth,
      salt,
      publicKey: await exportPublicKey(keyPair.publicKey),
      ...(await encryptPrivateKey(keyPair.privateKey, kEnc)),
      account: await encryptHybrid(accountNumber, keyPair.publicKey),
      accountLast4: lastFourDigits(accountNumber),
    };
  }
}
