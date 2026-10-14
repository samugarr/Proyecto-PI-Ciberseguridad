
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.css']})

export class LoginPage {

  email = '';
  password = '';

  constructor(private http: HttpClient,  private router: Router
) {}

  login() {
    const body = {
      email: this.email,
      password: this.password
    };

    this.http.post('/api/login', body)
      .subscribe({
        next: (response: any) => {
          console.log('Login correcto:', response);
      this.router.navigate(['/transactions']);
        },
        error: (error: any) => {
          console.error('Error en el login:', error);
          alert('Error al iniciar sesión');
        }
      });
  }
}
