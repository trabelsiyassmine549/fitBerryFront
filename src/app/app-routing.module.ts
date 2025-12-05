import { Routes } from '@angular/router';
import { ArticleListComponent } from './components/article-list/article-list.component';
import { ArticleFormComponent } from './components/article-form/article-form.component';
import { ClientProfileComponent } from './components/client-profile/client-profile.component';
import { AccueilComponent } from './components/accueil/accueil.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { ArticleSectionComponent } from './components/client-profile/sections/article-section/article-section.component';
import { AuthGuard, RoleGuard } from './guards/auth.guard';
import { PlanListComponent } from './components/planAi/plan-list/plan-list.component';
import { PlanDetailComponent } from './components/planAi/plan-detail/plan-detail.component';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    component: AccueilComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: RegisterComponent
  },

  // Client routes - Require CLIENT role
  {
    path: 'articles',
    component: ArticleSectionComponent,
    canActivate: [AuthGuard],
    data: { roles: ['CLIENT', 'NUTRITIONNISTE', 'ADMIN'] }
  },
  {
    path: 'client/:id/profile',
    component: ClientProfileComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      roles: ['CLIENT', 'ADMIN'],
      requiresOwnResource: true
    },
  },
  {
    path: 'plans',
    component: PlanListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CLIENT'] }
  },
  {
    path: 'plans/:id',
    component: PlanDetailComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CLIENT'] }
  },

  // Nutritionist routes - Require NUTRITIONNISTE role
  {
    path: 'nutritionniste/:id/articles',
    component: ArticleListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      roles: ['NUTRITIONNISTE', 'ADMIN'],
      requiresOwnResource: true
    }
  },
  {
    path: 'create-article',
    component: ArticleFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['NUTRITIONNISTE', 'ADMIN'] }
  },

  // Admin routes - Require ADMIN role
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },

  // Wildcard route - redirect to home
  {
    path: '**',
    redirectTo: ''
  }
];
