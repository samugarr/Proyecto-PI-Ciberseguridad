
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { deriveKeys } from '../../services/crypto.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.css']})

export class LoginPage {

  email = '';
  password = '';

  constructor(private http: HttpClient,  private router: Router
) {}

  async login() {
    try {
      // 1) Pedimos al servidor la sal de este usuario (la sal no es secreta)
      const saltResponse: any = await firstValueFrom(
        this.http.post('/api/salt', { email: this.email })
      );

      // 2) Argon2id en el navegador con la MISMA sal que en el registro
      //    -> obtenemos la misma K_auth que se calculó al registrarse
      const keys = await deriveKeys(this.password, saltResponse.salt);

      // 3) Enviamos K_auth (NO la contraseña)
      const response: any = await firstValueFrom(
        this.http.post('/api/login', { email: this.email, password: keys.kAuth })
      );
      console.log('Login correcto:', response);

      // Guardamos los datos públicos del usuario para las demás páginas
      sessionStorage.setItem('user', JSON.stringify(response.user));
      this.router.navigate(['/transactions']);

    } catch (error: any) {
      console.error('Error en el login:', error);
      alert(error.error?.error ?? 'Error al iniciar sesión');
    }
  }
}
