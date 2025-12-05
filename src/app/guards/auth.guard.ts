import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.log('Not authenticated, redirecting to login');
      return this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // REMOVED automatic token refresh on route navigation
    // Token will be refreshed by the interceptor when needed (on 401 responses)

    // Check role-based access
    const requiredRoles = route.data['roles'] as Array<string>;
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = this.authService.hasAnyRole(requiredRoles);

      if (!hasRequiredRole) {
        console.log('User does not have required role');
        // Redirect to appropriate page based on user's role
        this.authService.navigateBasedOnRole();
        return false;
      }
    }

    // Check if accessing own resource
    const requiresOwnResource = route.data['requiresOwnResource'];
    if (requiresOwnResource) {
      const routeUserId = route.params['id'];
      const currentUserId = this.authService.getUserId();

      if (routeUserId && currentUserId && parseInt(routeUserId) !== currentUserId) {
        // Allow admins to access any resource
        if (!this.authService.hasRole('ADMIN')) {
          console.log('User cannot access another user\'s resource');
          this.authService.navigateBasedOnRole();
          return false;
        }
      }
    }

    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {

    const requiredRoles = route.data['roles'] as Array<string>;

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    const hasRequiredRole = this.authService.hasAnyRole(requiredRoles);

    if (!hasRequiredRole) {
      console.log('Access denied: insufficient permissions');
      this.authService.navigateBasedOnRole();
      return false;
    }

    return true;
  }
}
