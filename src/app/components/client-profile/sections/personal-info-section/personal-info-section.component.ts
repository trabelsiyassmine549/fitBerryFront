import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-personal-info-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal-info-section.component.html',
  styleUrls: ['./personal-info-section.component.css']
})
export class PersonalInfoSectionComponent {
  @Input() profileForm!: FormGroup; // Changé de 'form' à 'profileForm'
  @Input() niveauActiviteOptions: any[] = [];
}