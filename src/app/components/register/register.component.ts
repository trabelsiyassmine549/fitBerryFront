import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { AuthService, RegisterRequest } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  currentStep = 1;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
      confirmPassword: ['', Validators.required],
      role: ['CLIENT', Validators.required],

      // Nutritionist-specific fields
      nom: [''],
      prenom: [''],

      // Client-specific fields (optional during registration)
      age: [''],
      sexe: [''],
      poids: [''],
      taille: [''],
      objectifs: [''],
      allergies: [''],
      maladiesChroniques: [''],
      niveauActivite: [''],

      agreeToTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });

    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      this.updateValidators(role);
    });
  }

  updateValidators(role: string) {
    ['nom', 'prenom', 'age', 'sexe', 'poids', 'taille'].forEach(field => {
      this.registerForm.get(field)?.clearValidators();
      this.registerForm.get(field)?.updateValueAndValidity();
    });

    if (role === 'NUTRITIONNISTE') {
      this.registerForm.get('nom')?.setValidators([Validators.required, Validators.minLength(2)]);
      this.registerForm.get('prenom')?.setValidators([Validators.required, Validators.minLength(2)]);
    } else if (role === 'CLIENT') {
      this.registerForm.get('age')?.setValidators([Validators.min(1), Validators.max(150)]);
      this.registerForm.get('poids')?.setValidators([Validators.min(1)]);
      this.registerForm.get('taille')?.setValidators([Validators.min(1)]);
    }

    ['nom', 'prenom', 'age', 'sexe', 'poids', 'taille'].forEach(field => {
      this.registerForm.get(field)?.updateValueAndValidity();
    });
  }

  passwordValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);

    const valid = hasUpperCase && hasLowerCase && hasNumber;
    return valid ? null : { passwordStrength: true };
  }

  passwordMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('motDePasse')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  nextStep() {
    if (this.currentStep === 1) {
      const step1Fields = ['email', 'role'];
      const role = this.registerForm.get('role')?.value;

      if (role === 'NUTRITIONNISTE') {
        step1Fields.push('nom', 'prenom');
      }

      let isValid = true;
      step1Fields.forEach(field => {
        const control = this.registerForm.get(field);
        control?.markAsTouched();
        if (control?.invalid) isValid = false;
      });
      if (isValid) this.currentStep = 2;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const role = this.registerForm.get('role')?.value;
      let registerData: RegisterRequest = {
        email: this.registerForm.get('email')?.value,
        motDePasse: this.registerForm.get('motDePasse')?.value,
        role: role
      };

      if (role === 'NUTRITIONNISTE') {
        registerData.nom = this.registerForm.get('nom')?.value;
        registerData.prenom = this.registerForm.get('prenom')?.value;
      } else if (role === 'CLIENT') {
        const age = this.registerForm.get('age')?.value;
        const poids = this.registerForm.get('poids')?.value;
        const taille = this.registerForm.get('taille')?.value;

        if (age) registerData.age = parseInt(age);
        if (this.registerForm.get('sexe')?.value) registerData.sexe = this.registerForm.get('sexe')?.value;
        if (poids) registerData.poids = parseFloat(poids);
        if (taille) registerData.taille = parseFloat(taille);
        if (this.registerForm.get('objectifs')?.value) registerData.objectifs = this.registerForm.get('objectifs')?.value;
        if (this.registerForm.get('allergies')?.value) registerData.allergies = this.registerForm.get('allergies')?.value;
        if (this.registerForm.get('maladiesChroniques')?.value) registerData.maladiesChroniques = this.registerForm.get('maladiesChroniques')?.value;
        if (this.registerForm.get('niveauActivite')?.value) registerData.niveauActivite = this.registerForm.get('niveauActivite')?.value;
      }

      this.authService.register(registerData).subscribe({
        next: (user) => {
          console.log('Registration successful:', user);
          this.isLoading = false;
          this.successMessage = 'Registration successful! Redirecting to login...';

          setTimeout(() => {
            this.router.navigate(['/login'], {
              queryParams: { registered: 'true', email: user.email }
            });
          }, 2000);
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.isLoading = false;

          if (error.status === 400) {
            this.errorMessage = error.error?.error || 'Invalid registration data';
          } else if (error.status === 409) {
            this.errorMessage = 'Email already exists';
          } else if (error.status === 0) {
            this.errorMessage = 'Cannot connect to server. Please try again later.';
          } else {
            this.errorMessage = 'Registration failed. Please try again.';
          }
        }
      });
    } else {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Must be at least ${minLength} characters`;
    }
    if (field?.hasError('min')) {
      const min = field.errors?.['min'].min;
      return `Must be at least ${min}`;
    }
    if (field?.hasError('max')) {
      const max = field.errors?.['max'].max;
      return `Must be at most ${max}`;
    }
    if (field?.hasError('passwordStrength')) {
      return 'Password must contain uppercase, lowercase, and number';
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'email': 'Email',
      'motDePasse': 'Password',
      'nom': 'Last Name',
      'prenom': 'First Name',
      'age': 'Age',
      'sexe': 'Gender',
      'poids': 'Weight',
      'taille': 'Height'
    };
    return labels[fieldName] || fieldName;
  }

  getPasswordStrength(): string {
    const password = this.registerForm.get('motDePasse')?.value;
    if (!password) return '';

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length;

    if (length >= 12 && hasUpperCase && hasLowerCase && hasNumber && hasSpecial) {
      return 'strong';
    } else if (length >= 8 && hasUpperCase && hasLowerCase && hasNumber) {
      return 'medium';
    } else {
      return 'weak';
    }
  }

  get isNutritionist(): boolean {
    return this.registerForm.get('role')?.value === 'NUTRITIONNISTE';
  }

  get isClient(): boolean {
    return this.registerForm.get('role')?.value === 'CLIENT';
  }
}
