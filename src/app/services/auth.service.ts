import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { NotificationService } from './notification.service';

export interface RegisterRequest {
  email: string;
  motDePasse: string;
  role: 'CLIENT' | 'NUTRITIONNISTE' | 'ADMIN';
  nom?: string;
  prenom?: string;
  age?: number;
  sexe?: string;
  poids?: number;
  taille?: number;
  objectifs?: string;
  allergies?: string;
  maladiesChroniques?: string;
  niveauActivite?: string;
}

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: UserDTO;
}

export interface UserDTO {
  id: number;
  email: string;
  role: string;
  nom?: string;
  prenom?: string;
  age?: number;
  sexe?: string;
  poids?: number;
  taille?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/users';

  private _currentUser = signal<UserDTO | null>(null);
  private _isAuthenticated = signal<boolean>(false);
  private _isLoading = signal<boolean>(false);

  currentUser = computed(() => this._currentUser());
  isAuthenticated = computed(() => this._isAuthenticated());
  isLoading = computed(() => this._isLoading());
  userRole = computed(() => this._currentUser()?.role || null);
  isClient = computed(() => this._currentUser()?.role === 'CLIENT');
  isNutritionist = computed(() => this._currentUser()?.role === 'NUTRITIONNISTE');
  isAdmin = computed(() => this._currentUser()?.role === 'ADMIN');

  constructor(
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.checkAuthState();
  }

  register(request: RegisterRequest): Observable<UserDTO> {
    this._isLoading.set(true);

    return this.http.post<UserDTO>(`${this.apiUrl}/register`, request).pipe(
      tap(user => {
        console.log('Registration successful:', user);
        this._isLoading.set(false);
      }),
      catchError(error => {
        this._isLoading.set(false);
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post('/api/users/login', credentials).pipe(
      tap((response: any) => {
        if (response.accessToken && response.refreshToken) {
          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);

          if (response.user && response.user.id) {
            localStorage.setItem('user_id', response.user.id.toString());
          }

          this.handleAuthSuccess(response);

          this.notificationService.getMyNotifications().subscribe({
            next: () => console.log('Notifications loaded'),
            error: (error) => console.error('Error loading notifications:', error)
          });

          this.notificationService.startPolling().subscribe();

          this.navigateBasedOnRole();
        }
      })
    );
  }

  logout(): Observable<any> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.clearAuthData();
      this.router.navigate(['/login']);
      return throwError(() => new Error('No refresh token found'));
    }

    this.notificationService.stopPolling();

    return this.http.post(`${this.apiUrl}/logout`, { refreshToken }).pipe(
      tap(() => {
        this.clearAuthData();
        this.router.navigate(['/login']);
      }),
      catchError(error => {
        console.error('Logout error:', error);
        this.clearAuthData();
        this.router.navigate(['/login']);
        return throwError(() => error);
      })
    );
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.clearAuthData();
      return throwError(() => new Error('No refresh token available'));
    }

    console.log('Attempting to refresh token...');

    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(response => {
        console.log('Token refresh successful');
        this.handleAuthSuccess(response);
      }),
      catchError(error => {
        console.error('Token refresh error:', error);
        if (error.status === 401 || error.status === 403) {
          console.log('Token refresh failed with 401/403 - clearing auth');
          this.clearAuthData();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  private handleAuthSuccess(response: LoginResponse): void {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('tokenType', response.tokenType);
    localStorage.setItem('expiresIn', response.expiresIn.toString());
    localStorage.setItem('user', JSON.stringify(response.user));

    const expirationTime = new Date().getTime() + (response.expiresIn * 1000);
    localStorage.setItem('tokenExpiration', expirationTime.toString());

    this._currentUser.set(response.user);
    this._isAuthenticated.set(true);

    console.log('Authentication successful:', response.user);
  }

  private clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('user');

    this._currentUser.set(null);
    this._isAuthenticated.set(false);
  }

  private checkAuthState(): void {
    const token = this.getAccessToken();
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this._currentUser.set(user);
        this._isAuthenticated.set(true);

        this.notificationService.getMyNotifications().subscribe({
          next: () => console.log('Notifications loaded'),
          error: (error) => console.error('Error loading notifications:', error)
        });

        this.notificationService.startPolling().subscribe();

        console.log('User authenticated from storage:', user.email);
      } catch (e) {
        console.error('Error parsing user data:', e);
        this.clearAuthData();
      }
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getTokenType(): string {
    return localStorage.getItem('tokenType') || 'Bearer';
  }

  isTokenExpired(): boolean {
    const expiration = localStorage.getItem('tokenExpiration');
    if (!expiration) return true;

    const expirationTime = parseInt(expiration, 10);
    const currentTime = new Date().getTime();

    return currentTime >= expirationTime;
  }

  shouldRefreshToken(): boolean {
    const expiration = localStorage.getItem('tokenExpiration');
    if (!expiration) return false;

    const expirationTime = parseInt(expiration, 10);
    const currentTime = new Date().getTime();

    return currentTime >= (expirationTime - 60000) && currentTime < expirationTime;
  }

  hasRole(role: string): boolean {
    return this._currentUser()?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const userRole = this._currentUser()?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  getUserId(): number | null {
    return this._currentUser()?.id || null;
  }

  getCurrentUserId(): number | null {
    const userId = localStorage.getItem('user_id');
    return userId ? parseInt(userId, 10) : null;
  }

  navigateBasedOnRole(): void {
    const role = this._currentUser()?.role;
    const userId = this._currentUser()?.id;

    console.log('Navigating based on role:', role, 'userId:', userId);

    switch (role) {
      case 'ADMIN':
        this.router.navigate(['/admin']);
        break;
      case 'NUTRITIONNISTE':
        this.router.navigate([`/nutritionniste/${userId}/articles`]);
        break;
      case 'CLIENT':
        this.router.navigate([`/client/${userId}/profile`]);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}
