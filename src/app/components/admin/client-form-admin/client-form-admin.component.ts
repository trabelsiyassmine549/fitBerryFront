import { Component, Input, Output, EventEmitter, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { User, Role } from '../../../models/admin.model';

type ExtendedUser = User & {
  prenom?: string;
  nom?: string;
  motDePasse?: string;
};

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './client-form-admin.component.html',
  styleUrls: ['./client-form-admin.component.css']
})
export class UserFormComponent implements OnInit {
  private adminService = inject(AdminService);

  @Input() user: User | null = null;
  @Input() isEditMode = false;
  @Output() submit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  isSubmitting = signal(false);
  pageTitle = signal('Create User');
  showNotification = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  userData = signal<ExtendedUser>({
    id: undefined,
    prenom: '',
    nom: '',
    email: '',
    motDePasse: '',
    role: Role.CLIENT
  });

  isFormValid = computed(() => {
    const u = this.userData();
    const hasBasicInfo = (u.email?.trim().length || 0) > 0 &&
                         this.isValidEmail(u.email);

    // For creation, need prenom, nom, and password
    if (!this.isEditMode) {
      return hasBasicInfo &&
             (u.prenom?.trim().length || 0) > 0 &&
             (u.nom?.trim().length || 0) > 0 &&
             (u.motDePasse?.trim().length || 0) >= 6;
    }

    // For edit, only email and role can be changed (backend limitation)
    return hasBasicInfo;
  });

  constructor() {
    effect(() => {
      const n = this.showNotification();
      if (n) setTimeout(() => this.showNotification.set(null), 3000);
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.user) {
      this.pageTitle.set('Edit User');
      this.userData.set({ ...this.user } as ExtendedUser);
    } else {
      this.pageTitle.set('Create User');
    }
  }

  updateField(field: keyof ExtendedUser, event: Event): void {
    const target = event.target as HTMLInputElement;
    let value: ExtendedUser[keyof ExtendedUser];
    if (field === 'role') {
      value = target.value as Role as ExtendedUser[keyof ExtendedUser];
    } else {
      value = target.value as ExtendedUser[keyof ExtendedUser];
    }
    this.userData.update(u => ({ ...u, [field]: value }));
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getRoleLabel(role: Role): string {
    switch (role) {
      case Role.ADMIN: return 'Admin';
      case Role.NUTRITIONNISTE: return 'Nutritionist';
      default: return 'Client';
    }
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.showNotification.set({ type: 'error', message: 'Missing or invalid fields' });
      return;
    }

    this.isSubmitting.set(true);
    const data = this.userData();

    if (this.isEditMode && data.id) {
      // Backend only allows updating email and role
      const updatePayload = {
        email: data.email.trim(),
        role: data.role
      };

      this.adminService.updateUser(data.id, updatePayload)
        .subscribe({
          next: () => {
            this.showNotification.set({ type: 'success', message: 'User updated successfully' });
            this.submit.emit();
          },
          error: (err) => {
            console.error('Update error:', err);
            const errorMsg = err?.message || 'Error updating user';
            this.showNotification.set({ type: 'error', message: errorMsg });
          }
        }).add(() => this.isSubmitting.set(false));
    } else {
      // Creation - must use signup endpoint with prenom, nom, email, password
      const createPayload = {
        prenom: data.prenom!.trim(),
        nom: data.nom!.trim(),
        email: data.email.trim(),
        motDePasse: data.motDePasse!.trim(),
        role: data.role
      };

      this.adminService.createUser(createPayload)
        .subscribe({
          next: () => {
            this.showNotification.set({ type: 'success', message: 'User created successfully' });
            this.submit.emit();
          },
          error: (err) => {
            console.error('Create error:', err);
            const errorMsg = err?.message || 'Error creating user';
            this.showNotification.set({ type: 'error', message: errorMsg });
          }
        }).add(() => this.isSubmitting.set(false));
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
