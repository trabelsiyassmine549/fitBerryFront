import { Component, Input, Output, EventEmitter, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { Nutritionniste, User, Role } from '../../../models/admin.model';

type NutritionnisteFormData = Nutritionniste & { actif?: boolean };

@Component({
  selector: 'app-nutritionniste-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './nutritionniste-form-admin.component.html',
  styleUrls: ['./nutritionniste-form-admin.component.css']
})
export class NutritionnisteFormComponent implements OnInit {
  private adminService = inject(AdminService);

  @Input() nutritionniste: Nutritionniste | null = null;
  @Input() isEditMode = false;
  @Output() submit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  isSubmitting = signal(false);
  pageTitle = signal('Ajouter un nutritionniste');
  showNotification = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  nutritionnisteData = signal<NutritionnisteFormData>({
    id: undefined,
    prenom: '',
    nom: '',
    email: '',
    role: Role.NUTRITIONNISTE,
    specialite: '',
    telephone: '',
    nombreArticles: 0,
    actif: true
  });
  selectedSpecialite = signal<string>('');

  specialites = [
    'Nutrition Sportive',
    'Perte de Poids',
    'Nutrition Pédiatrique',
    'Nutrition Végétarienne',
    'Troubles Alimentaires',
    'Nutrition Clinique',
    'Nutrition Gériatrique',
    'Autre'
  ];

  isFormValid = computed(() => {
    const n = this.nutritionnisteData();
    return (n.prenom?.trim().length || 0) > 0 &&
           (n.nom?.trim().length || 0) > 0 &&
           (n.email?.trim().length || 0) > 0 &&
           this.isValidEmail(n.email);
  });

  constructor() {
    effect(() => {
      const n = this.showNotification();
      if (n) setTimeout(() => this.showNotification.set(null), 3000);
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.nutritionniste) {
      this.pageTitle.set('Modifier un nutritionniste');
      this.nutritionnisteData.set({ ...this.nutritionniste } as NutritionnisteFormData);
      const current = (this.nutritionniste as NutritionnisteFormData).specialite || '';
      this.selectedSpecialite.set(this.specialites.includes(current) ? current : 'Autre');
    }
  }

  updateField(field: keyof NutritionnisteFormData, event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = field === 'actif'
      ? target.checked as NutritionnisteFormData[keyof NutritionnisteFormData]
      : target.value as NutritionnisteFormData[keyof NutritionnisteFormData];
    this.nutritionnisteData.update(n => ({ ...n, [field]: value }));
  }

  selectSpecialite(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const chosen = target.value;
    this.selectedSpecialite.set(chosen);
    if (chosen === 'Autre') {
      const current = this.nutritionnisteData().specialite || '';
      const keep = this.specialites.includes(current) ? '' : current;
      this.nutritionnisteData.update(n => ({ ...n, specialite: keep }));
    } else {
      this.nutritionnisteData.update(n => ({ ...n, specialite: chosen }));
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  articlesPublished(): number {
    return this.nutritionnisteData().nombreArticles ?? 0;
  }

  isOtherSelected(): boolean {
    return this.selectedSpecialite() === 'Autre';
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.showNotification.set({ type: 'error', message: 'Champs manquants ou invalides' });
      return;
    }

    this.isSubmitting.set(true);
    const minimalPayload: User = {
      id: this.nutritionnisteData().id,
      email: this.nutritionnisteData().email.trim(),
      role: Role.NUTRITIONNISTE
    };

    if (this.isEditMode && this.nutritionnisteData().id) {
      this.adminService.updateUser(this.nutritionnisteData().id!, minimalPayload).subscribe({
        next: () => {
          this.showNotification.set({ type: 'success', message: 'Nutritionniste mis à jour' });
          this.submit.emit();
        },
        error: () => {
          this.showNotification.set({ type: 'error', message: 'Erreur mise à jour nutritionniste' });
        }
      }).add(() => this.isSubmitting.set(false));
    } else {
      this.isSubmitting.set(false);
      this.showNotification.set({
        type: 'error',
        message: 'Création non supportée (POST /api/admin/users absent)'
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
