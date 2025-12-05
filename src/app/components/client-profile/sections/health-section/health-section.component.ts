import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-health-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './health-section.component.html',
  styleUrls: ['./health-section.component.css']
})
export class HealthSectionComponent {
  @Input() profileForm!: FormGroup; // Changé de 'form' à 'profileForm'
}