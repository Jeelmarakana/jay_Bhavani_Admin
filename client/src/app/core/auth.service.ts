import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

const API = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  get isLoggedIn(): boolean {
    return Boolean(localStorage.getItem('jb_admin_token'));
  }

  login(email: string, password: string): Observable<{ token: string; email: string }> {
    return this.http.post<{ token: string; email: string }>(`${API}/auth/login`, { email, password }).pipe(
      tap((response) => {
        localStorage.setItem('jb_admin_token', response.token);
        localStorage.setItem('jb_admin_email', response.email);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('jb_admin_token');
    localStorage.removeItem('jb_admin_email');
  }
}
