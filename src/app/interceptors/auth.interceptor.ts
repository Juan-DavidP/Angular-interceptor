import { isPlatformServer } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/service-auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const platformId = inject(PLATFORM_ID);
  const token = localStorage.getItem('token');
  const authService = inject(AuthService);

  //comprobación si se esta ejecutando en el navegador
  if (isPlatformServer(platformId)) { return next(req); } 

  let headers = req.headers.set('Content-Type', 'application/json');
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const authReq = req.clone({ headers });

  //Usuario pide algo con un Token
  //Server responde un 403 por token expirado, interceptamos el error y pedimos refrescar
  //el token si va todo bien, utilizamos y guardamos el nuevo token con la petición que 
  //había fallado anteriormente
  //si es otro error lo devolvemos
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        return authService.refreshToken().pipe(
          switchMap(newToken => {
            localStorage.setItem('token', newToken)

            const updateHeaders = req.headers.set('Authorization', `Bearer ${newToken}`);

            const newRequest = req.clone({ headers: updateHeaders })

            return next(newRequest);
          })
        )
      }
      return throwError(() => error)
    })
  );
};
