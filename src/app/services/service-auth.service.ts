import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // baseUrl = process.env.BASE_URL; forma que se debe hacer
  baseUrl = 'https://localhost.com:4000';

  htpp = inject(HttpClient);
  router = inject(Router);

  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    // token + refreshToken

    if (!refreshToken) {
      this.logOut();
      return throwError(() => new Error("No refresh Token found"));
    }

    return this.htpp
      .post<{ refreshToken: string }>(`${this.baseUrl}/token`, { refreshToken })
      .pipe(
        map((response) => response.refreshToken),
        tap((newAccessToken) => {
          localStorage.setItem('token', newAccessToken)
          return newAccessToken
        }),
        catchError((error) => {
          this.logOut()
          return throwError(() => error)
        }))
  }

  logOut() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  constructor() { }
}
