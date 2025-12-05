import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanNutritionnel } from 'src/app/models/plan.model';
import { PlanService } from 'src/app/services/plan.service';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-plan-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plan-detail.component.html',
  styleUrls: ['./plan-detail.component.css']
})
export class PlanDetailComponent implements OnInit {
  plan: PlanNutritionnel | null = null;
  isLoading = true;
  error: string | null = null;
  userEmail = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private planService: PlanService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const planId = this.route.snapshot.paramMap.get('id');
    if (planId) {
      this.loadPlan(+planId);
    }
    this.loadUserEmail();
  }

  loadUserEmail(): void {
    const user = this.authService.currentUser();
    this.userEmail = user?.email || 'User';
  }

  loadPlan(planId: number): void {
    this.isLoading = true;
    this.error = null;

    this.planService.getPlanById(planId).subscribe({
      next: (plan) => {
        this.plan = plan;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading plan:', error);
        this.error = 'Failed to load nutrition plan';
        this.isLoading = false;
      }
    });
  }

  downloadPDF(): void {
    if (!this.plan) return;

    this.planService.downloadPlanPDF(this.plan.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nutrition-plan-${this.plan!.id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading PDF:', error);
        this.error = 'Failed to download PDF';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/plans']);
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRecommendationSections(): string[] {
    if (!this.plan) return [];
    return this.plan.recommendations.split('\n\n').filter(section => section.trim());
  }

  formatRecommendationSection(section: string): { heading: string, content: string[] } {
    const lines = section.split('\n').filter(line => line.trim());
    const heading = lines[0].replace(':', '');
    const content = lines.slice(1);
    return { heading, content };
  }
}
