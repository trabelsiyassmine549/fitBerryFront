import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClientService } from '../../../../services/client.service';
import { AuthService } from '../../../../services/auth.service';
import { NotificationModalComponent } from "../../../notification-modal/notification-modal.component";

@Component({
  selector: 'app-profile-summary',
  standalone: true,
  imports: [CommonModule, NotificationModalComponent],
  templateUrl: './profile-summary.component.html',
  styleUrls: ['./profile-summary.component.css']
})
export class ProfileSummaryComponent implements OnChanges, OnInit {
  @Input() profileForm!: FormGroup;
  @Input() imc: number | null = null;
  @Input() imcCategory: string = '';
  @Input() imcCategoryClass: string = '';
  @Output() editProfile = new EventEmitter<void>();

  calories: number = 0;
  proteins: number = 0;
  carbs: number = 0;
  fats: number = 0;
  macroData: any[] = [];

  userEmail: string = 'Loading...';
  userInitials: string = 'U';
  isLoading: boolean = true;
  showSuccessMessage: boolean = true;

  constructor(
    private router: Router,
    private clientService: ClientService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserData();

    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 5000);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['profileForm'] && this.profileForm) {
      this.calculateAll();
    }
  }

  loadUserData(): void {
    this.isLoading = true;

    const currentUserId = this.authService.getCurrentUserId();

    if (currentUserId) {
      this.clientService.getClientProfile(currentUserId).subscribe({
        next: (clientProfile) => {
          this.userEmail = clientProfile.email || 'user@example.com';
          this.userInitials = this.getUserInitials(this.userEmail);
          this.isLoading = false;
          console.log('User data loaded:', clientProfile);
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          this.userEmail = 'Load error';
          this.userInitials = 'E';
          this.isLoading = false;
          this.loadUserFromForm();
        }
      });
    } else {
      this.setDefaultUser();
      this.isLoading = false;
    }
  }

  private loadUserFromForm(): void {
    if (this.profileForm) {
      const email = this.profileForm.get('email')?.value;
      if (email) {
        this.userEmail = email;
        this.userInitials = this.getUserInitials(email);
      } else {
        this.setDefaultUser();
      }
    } else {
      this.setDefaultUser();
    }
  }

  private getUserInitials(email: string): string {
    if (!email || email === 'Loading...' || email === 'Load error') {
      return 'U';
    }

    try {
      const username = email.split('@')[0];
      const nameParts = username.split(/[._-]/);

      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      } else if (username.length >= 2) {
        return username.substring(0, 2).toUpperCase();
      } else {
        return username.charAt(0).toUpperCase();
      }
    } catch (error) {
      return 'U';
    }
  }

  private setDefaultUser(): void {
    this.userEmail = 'User';
    this.userInitials = 'U';
  }

  navigateToArticles(): void {
    this.router.navigate(['/articles']);
  }

  navigateToPlans(): void {
    this.router.navigate(['/plans']);
  }
  

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  calculateAll(): void {
    this.calories = this.calculateCalories();
    this.proteins = Math.round(this.calories * 0.3 / 4);
    this.carbs = Math.round(this.calories * 0.5 / 4);
    this.fats = Math.round(this.calories * 0.2 / 9);

    this.macroData = [
      {
        name: 'Proteins',
        value: this.proteins,
        color: '#FF6B4A',
        percentage: 30
      },
      {
        name: 'Carbs',
        value: this.carbs,
        color: '#9B7EDE',
        percentage: 50
      },
      {
        name: 'Fats',
        value: this.fats,
        color: '#7FD15E',
        percentage: 20
      }
    ];
  }

  calculateCalories(): number {
    const weight = this.profileForm.get('poids')?.value;
    const height = this.profileForm.get('taille')?.value;
    const age = this.profileForm.get('age')?.value;
    const sex = this.profileForm.get('sexe')?.value;
    const activityLevel = this.profileForm.get('niveauActivite')?.value;

    if (!weight || !height || !age || !sex) return 0;

    let bmr = 0;

    if (sex === 'Homme' || sex === 'Male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    let activityFactor = 1.2;
    switch (activityLevel) {
      case 'Moderate':
      case 'Modéré':
        activityFactor = 1.375;
        break;
      case 'Active':
      case 'Actif':
        activityFactor = 1.55;
        break;
      case 'Very Active':
      case 'Très actif':
        activityFactor = 1.725;
        break;
    }

    return Math.round(bmr * activityFactor);
  }

  onEditProfile(): void {
    this.editProfile.emit();
  }


}


