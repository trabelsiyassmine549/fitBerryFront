import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpEvent, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

// Track if we're currently refreshing the token
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip authentication for public endpoints
  const publicEndpoints = [
    '/api/users/register',
    '/api/users/login',
    '/api/users/refresh',
    '/api/articles/client/all'
  ];

  const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));

  if (isPublicEndpoint) {
    console.log(' Public endpoint, no auth needed:', req.url);
    return next(req);
  }

  // Add token to request
  const token = authService.getAccessToken();

  if (token) {
    const tokenType = authService.getTokenType();
    req = req.clone({
      setHeaders: {
        Authorization: `${tokenType} ${token}`
      }
    });
    console.log(' Added token to request:', req.url);
  } else {
    console.warn(' No token available for request:', req.url);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.log(' 401 Unauthorized error for:', req.url);
        return handle401Error(req, next, authService, router);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = authService.getRefreshToken();

    if (refreshToken) {
      console.log(' Attempting to refresh token...');

      return authService.refreshToken().pipe(
        switchMap((response: any) => {
          isRefreshing = false;
          refreshTokenSubject.next(response.accessToken);

          console.log(' Token refreshed successfully, retrying request');

          // Retry the original request with new token
          const tokenType = authService.getTokenType();
          const clonedRequest = request.clone({
            setHeaders: {
              Authorization: `${tokenType} ${response.accessToken}`
            }
          });

          return next(clonedRequest);
        }),
        catchError((err) => {
          isRefreshing = false;
          console.error(' Token refresh failed, logging out');

          // Clear auth data and redirect to login
          authService.logout().subscribe();
          router.navigate(['/login']);

          return throwError(() => err);
        })
      );
    } else {
      console.log(' No refresh token available, redirecting to login');
      isRefreshing = false;
      router.navigate(['/login']);
      return throwError(() => new Error('No refresh token available'));
    }
  }

  // If already refreshing, wait for the new token
  return refreshTokenSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap(token => {
      const tokenType = authService.getTokenType();
      const clonedRequest = request.clone({
        setHeaders: {
          Authorization: `${tokenType} ${token}`
        }
      });
      return next(clonedRequest);
    })
  );
}
