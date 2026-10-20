import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { deriveKeys, generateSalt } from '../../crypto/crypto.service';

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
    if (this.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      // Sal aleatoria nueva para este usuario
      const salt = generateSalt();

      // Argon2id en el navegador: contraseña + sal -> K_auth y K_enc
      const keys = await deriveKeys(this.password, salt);

      // Enviamos K_auth (NO la contraseña) y la sal
      const body = {
        name: this.name,
        email: this.email,
        telephone: this.telephone,
        password: keys.kAuth,
        salt: salt
      };

      // POST a /api/user -> el proxy lo redirige a http://localhost:3000/user
      const response = await firstValueFrom(this.http.post('/api/user', body));
      console.log('Usuario registrado:', response);
      alert('Usuario registrado correctamente. Ya puedes iniciar sesión.');
      this.router.navigate(['/login']);

    } catch (error: any) {
      console.error('Error en el registro:', error);
      alert(error.error?.error ?? 'Error al registrar el usuario');
    }
  }
}
