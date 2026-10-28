import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SessionService } from '../services/session.service';

// Añade "Authorization: Bearer <token>" a las peticiones a la API. Si el servidor responde 401
// con un token puesto, es que ha caducado o no es válido: se cierra la sesión y se vuelve al login.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const token = session.getToken();
  const request = token && req.url.startsWith('/api/')
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token) {
        session.logout();
      }
      return throwError(() => error);
    }),
  );
};
