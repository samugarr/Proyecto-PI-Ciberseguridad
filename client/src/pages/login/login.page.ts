import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { decryptPrivateKey, deriveKeys, importPublicKey } from '../../services/crypto.service';
import { SessionService } from '../../services/session.service';
import { LoginResponse, SaltResponse } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.css']
})
export class LoginPage {

  email = '';
  password = '';

  constructor(private http: HttpClient, private router: Router, private session: SessionService) {}

  async login() {
    try {
      // 1. La sal no es secreta: se pide al servidor para derivar las mismas claves que en el registro
      const { salt } = await firstValueFrom(
        this.http.post<SaltResponse>('/api/salt', { email: this.email }));
      const { kAuth, kEnc } = await deriveKeys(this.password, salt);

      // 2. Autenticación con K_auth. El servidor devuelve el token de sesión y E_{K_enc}(k_u)
      const response = await firstValueFrom(
        this.http.post<LoginResponse>('/api/login', { email: this.email, kAuth }));

      // 3. Solo quien conoce la contraseña puede obtener K_enc y descifrar k_u
      const privateKey = await decryptPrivateKey(response.keys, kEnc);
      const publicKey = await importPublicKey(response.keys.publicKey);

      this.session.start(response.user, response.token, { kEnc, privateKey, publicKey });
      this.router.navigate(['/transactions']);

    } catch (error: any) {
      console.error('Error en el login:', error);
      alert(error.error?.error ?? 'Error al iniciar sesión');
    }
  }
}
