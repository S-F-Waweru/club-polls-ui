import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom, Observable, tap } from 'rxjs'; // 👈 Added firstValueFrom
import { environment } from '../../environments/environment';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'bursar';
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'bursar';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = `${environment.apiUrl}auth`;

  // 👇 ADD THIS METHOD for the App Initializer handshake
  async checkSessionOnStartup(): Promise<AuthUser | null> {
    try {
      return await firstValueFrom(this.getProfile());
    } catch {
      return null; // Return null safely if cookie is missing/expired
    }
  }

  login(dto: LoginDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/login`, dto);
  }

  register(dto: RegisterDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/register`, dto);
  }

  getProfile(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.baseUrl}/me`);
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/logout`, {})
      .pipe(tap(() => this.router.navigate(['/login'])));
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
