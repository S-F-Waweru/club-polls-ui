import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthRole, AuthUser } from '../models/club.models';

export type { AuthUser };

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role: Exclude<AuthRole, 'member'>;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = `${environment.apiUrl}auth`;

  async checkSessionOnStartup(): Promise<AuthUser | null> {
    try {
      return await firstValueFrom(this.getProfile());
    } catch {
      return null;
    }
  }

  login(dto: LoginDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/login`, dto);
  }

  register(dto: RegisterDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/register`, dto);
  }

  getProfile(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.baseUrl}/me`);
  }

  logout(): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.baseUrl}/logout`, {})
      .pipe(tap(() => this.navigateToLogin()));
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  changePassword(dto: { currentPassword: string; newPassword: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/change-password`, dto);
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/forgot-password`, { email });
  }

  resetPassword(dto: { token: string; newPassword: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/reset-password`, dto);
  }
}
