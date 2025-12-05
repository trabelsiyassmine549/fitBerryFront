import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlanService } from '../../../services/plan.service';
import { PlanNutritionnel } from '../../../models/plan.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-plan-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plan-list.component.html',
  styleUrls: ['./plan-list.component.css']
})
export class PlanListComponent implements OnInit {
  plans: PlanNutritionnel[] = [];
  isLoading = true;
  isGenerating = false;
  error: string | null = null;
  userEmail = '';
  userId: number | null = null;

  constructor(
    private planService: PlanService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPlans();
    this.loadUserEmail();
  }

  loadUserEmail(): void {
  const user = this.authService.currentUser();
  this.userEmail = user?.email || 'User';
  }

  loadPlans(): void {
    this.isLoading = true;
    this.error = null;

    this.planService.getMyPlans().subscribe({
      next: (plans) => {
        this.plans = plans;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading plans:', error);
        this.error = 'Failed to load nutrition plans';
        this.isLoading = false;
      }
    });
  }

  generateNewPlan(): void {
    this.isGenerating = true;
    this.error = null;

    this.planService.generatePlan().subscribe({
      next: (plan) => {
        this.plans.unshift(plan);
        this.isGenerating = false;
      },
      error: (error) => {
        console.error('Error generating plan:', error);
        this.error = error.error?.error || 'Failed to generate plan. Please complete your profile first.';
        this.isGenerating = false;
      }
    });
  }

  viewPlan(planId: number): void {
    this.router.navigate(['/plans', planId]);
  }

  downloadPDF(planId: number, event: Event): void {
    event.stopPropagation();

    this.planService.downloadPlanPDF(planId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nutrition-plan-${planId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading PDF:', error);
        this.error = 'Failed to download PDF';
      }
    });
  }

  deletePlan(planId: number, event: Event): void {
    event.stopPropagation();

    if (confirm('Are you sure you want to delete this nutrition plan?')) {
      this.planService.deletePlan(planId).subscribe({
        next: () => {
          this.plans = this.plans.filter(p => p.id !== planId);
        },
        error: (error) => {
          console.error('Error deleting plan:', error);
          this.error = 'Failed to delete plan';
        }
      });
    }
  }

  navigateToProfile(): void {
    this.router.navigate(['/client/me/profile']);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  getUserInitials(): string {
    if (!this.userEmail) return 'U';

    const username = this.userEmail.split('@')[0];
    const nameParts = username.split(/[._-]/);

    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    } else if (username.length >= 2) {
      return username.substring(0, 2).toUpperCase();
    } else {
      return username.charAt(0).toUpperCase();
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
