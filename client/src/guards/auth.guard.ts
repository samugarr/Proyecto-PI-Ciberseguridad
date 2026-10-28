import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

// Impide abrir páginas privadas sin sesión (por ejemplo, escribiendo /transactions en la barra
// o tras recargar). Es solo para la interfaz: el servidor exige el token en cada petición.
export const authGuard: CanActivateFn = () => {
  if (inject(SessionService).loggedIn) {
    return true;
  }
  return inject(Router).createUrlTree(['/login']);
};
