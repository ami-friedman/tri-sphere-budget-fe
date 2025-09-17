import { Injectable, computed, effect, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

// Using the correct, detailed interfaces from your file
export interface UserAuth {
  username: string;
  email: string;
  password?: string;
}

export interface UserLogin {
  username: string;
  password?: string; // Made password optional to match your existing code
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.baseUrl;

  // --- State Management with Signals ---
  private authToken = signal<string | null>(null);
  public isLoggedIn = computed(() => !!this.authToken());

  constructor() {
    // On startup, load the token from localStorage into our signal
    const token = localStorage.getItem('access_token');
    if (token) {
      this.authToken.set(token);
    }

    // This effect runs whenever the isLoggedIn signal changes.
    // If the user logs out, it will automatically navigate them to the login page.
    effect(() => {
      if (!this.isLoggedIn()) {
        this.router.navigate(['/login']);
      }
    });
  }

  register(user: UserAuth): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, user);
  }

  // ** This is your correct login logic, now integrated with signals **
  login(credentials: UserLogin): Observable<AuthResponse> {
    const body = new URLSearchParams();
    body.set('username', credentials.username);
    body.set('password', credentials.password || '');

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/token`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
      .pipe(
        tap((res) => this.setSession(res.access_token))
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.authToken.set(null); // This will trigger the effect to navigate
  }

  private setSession(token: string): void {
    localStorage.setItem('access_token', token);
    this.authToken.set(token);
  }
}
