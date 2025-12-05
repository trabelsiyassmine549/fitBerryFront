import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Import sections
import { PersonalInfoSectionComponent } from './sections/personal-info-section/personal-info-section.component';
import { MeasurementsSectionComponent } from './sections/measurements-section/measurements-section.component';
import { GoalsSectionComponent } from './sections/goals-section/goals-section.component';
import { HealthSectionComponent } from './sections/health-section/health-section.component';
import { ProfileSummaryComponent } from './sections/profile-summary-section/profile-summary.component';

import { ClientService } from '../../services/client.service';
import { AuthService } from '../../services/auth.service'; // ADD THIS IMPORT
import { ClientProfile, UpdateClientProfileRequest } from '../../models/client.model';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PersonalInfoSectionComponent,
    MeasurementsSectionComponent,
    GoalsSectionComponent,
    HealthSectionComponent,
    ProfileSummaryComponent
  ],
  templateUrl: './client-profile.component.html',
  styleUrls: ['./client-profile.component.css']
})
export class ClientProfileComponent implements OnInit {
  profileForm!: FormGroup;
  clientProfile?: ClientProfile;
  clientId!: number;

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  calculatedImc: number | null = null;
  calculatedImcCategory: string = '';

  // Wizard steps
  currentStep = 1;
  totalSteps = 4;

  // Profile summary view
  showProfileSummary = false;

  niveauActiviteOptions = [
    { value: 'Sédentaire', label: 'Sédentaire' },
    { value: 'Modéré', label: 'Modéré' },
    { value: 'Actif', label: 'Actif' },
    { value: 'Très actif', label: 'Très actif' }
  ];

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private authService: AuthService, // ADD THIS
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get client ID from auth service instead of route parameters
    const currentUserId = this.authService.getCurrentUserId();

    if (currentUserId) {
      this.clientId = currentUserId;
      console.log('Client ID from auth service:', this.clientId);
      this.initForm();
      this.loadClientProfile();
    } else {
      this.errorMessage = 'Utilisateur non authentifié';
      console.error('No user ID found in auth service');
      // Redirect to login if no user ID
      this.router.navigate(['/login']);
    }
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      age: [null, [Validators.required, Validators.min(1), Validators.max(120)]],
      sexe: ['', Validators.required],
      niveauActivite: [''],
      poids: [null, [Validators.required, Validators.min(1), Validators.max(500)]],
      taille: [null, [Validators.required, Validators.min(1), Validators.max(300)]],
      objectifs: [''],
      allergies: [''],
      maladiesChroniques: ['']
    });

    // Auto IMC recalculation
    this.profileForm.get('poids')?.valueChanges.subscribe(() => this.calculateImc());
    this.profileForm.get('taille')?.valueChanges.subscribe(() => this.calculateImc());
  }

  calculateImc(): void {
    const poids = this.profileForm.get('poids')?.value;
    const taille = this.profileForm.get('taille')?.value;

    if (poids && taille && poids > 0 && taille > 0) {
      const tailleM = taille / 100;
      this.calculatedImc = parseFloat((poids / (tailleM * tailleM)).toFixed(1));
      this.calculatedImcCategory = this.determineImcCategory(this.calculatedImc);
    } else {
      this.calculatedImc = null;
      this.calculatedImcCategory = '';
    }
  }

  determineImcCategory(imc: number): string {
    if (imc < 18.5) return 'Insuffisance pondérale';
    if (imc < 25) return 'Poids normal';
    if (imc < 30) return 'Surpoids';
    if (imc < 35) return 'Obésité modérée';
    if (imc < 40) return 'Obésité sévère';
    return 'Obésité morbide';
  }

  loadClientProfile(): void {
    this.isLoading = true;

    console.log('Loading profile for current client ID:', this.clientId);

    this.clientService.getClientProfile(this.clientId).subscribe({
      next: (profile) => {
        console.log('Profile loaded successfully:', profile);
        this.clientProfile = profile;

        this.profileForm.patchValue({
          age: profile.age || null,
          sexe: profile.sexe || '',
          poids: profile.poids || null,
          taille: profile.taille || null,
          objectifs: profile.objectifs || '',
          allergies: profile.allergies || '',
          maladiesChroniques: profile.maladiesChroniques || '',
          niveauActivite: profile.niveauActivite || ''
        });

        this.calculateImc();
        this.isLoading = false;

        // If profile is complete, show summary
        if (profile.profilComplet) {
          this.showProfileSummary = true;
        }
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        if (error.status === 403) {
          this.errorMessage = 'Accès interdit. Vérifiez vos permissions.';
        } else if (error.status === 401) {
          this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          this.authService.logout();
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = 'Impossible de charger le profil.';
        }
        this.isLoading = false;
      }
    });
  }

  navigateToArticles(): void {
    console.log('Navigating to /articles...');
    this.router.navigate(['/articles']);
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToStep(step: number): void {
    this.currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSubmit(): void {
    // Clear previous messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validate required fields
    if (!this.profileForm.valid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires (âge, sexe, poids, taille)';

      // Mark all fields as touched to show validation errors
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });

      return;
    }

    this.isLoading = true;
    console.log('Submitting profile update for current user...');

    // Prepare the update request
    const updateRequest: UpdateClientProfileRequest = {
      age: this.profileForm.value.age,
      sexe: this.profileForm.value.sexe,
      poids: this.profileForm.value.poids,
      taille: this.profileForm.value.taille,
      objectifs: this.profileForm.value.objectifs || '',
      allergies: this.profileForm.value.allergies || '',
      maladiesChroniques: this.profileForm.value.maladiesChroniques || '',
      niveauActivite: this.profileForm.value.niveauActivite || ''
    };

    console.log('Update request:', updateRequest);

    // Call the service to update profile
    this.clientService.updateClientProfile(this.clientId, updateRequest).subscribe({
      next: (updatedProfile) => {
        console.log('Profile updated successfully:', updatedProfile);
        this.clientProfile = updatedProfile;
        this.isLoading = false;
        this.successMessage = 'Profil enregistré avec succès!';

        // Show summary after successful save
        setTimeout(() => {
          this.showProfileSummary = true;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1000);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.isLoading = false;

        if (error.status === 400) {
          this.errorMessage = 'Données invalides. Veuillez vérifier vos informations.';
        } else if (error.status === 403) {
          this.errorMessage = 'Accès interdit. Vous ne pouvez modifier que votre propre profil.';
        } else if (error.status === 401) {
          this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (error.status === 404) {
          this.errorMessage = 'Profil non trouvé.';
        } else {
          this.errorMessage = 'Erreur lors de la sauvegarde du profil. Veuillez réessayer.';
        }
      }
    });
  }

  editProfile(): void {
    this.showProfileSummary = false;
    this.successMessage = '';
    this.errorMessage = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getImcCategory(): string {
    return this.calculatedImcCategory || this.clientProfile?.categorieImc || 'Non calculé';
  }

  getImcCategoryClass(): string {
    const category = this.getImcCategory();
    if (category.includes('normal')) return 'text-success';
    if (category.includes('Insuffisance')) return 'text-warning';
    if (category.includes('Surpoids')) return 'text-warning';
    if (category.includes('Obésité')) return 'text-danger';
    return '';
  }

  getProgressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  getDisplayImc(): number | null {
    return this.calculatedImc || this.clientProfile?.imc || null;
  }
}
