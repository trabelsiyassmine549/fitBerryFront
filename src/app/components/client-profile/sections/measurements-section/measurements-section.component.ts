import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-measurements-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './measurements-section.component.html',
  styleUrls: ['./measurements-section.component.css']
})
export class MeasurementsSectionComponent {
  @Input() profileForm!: FormGroup; // Changé de 'form' à 'profileForm'
  @Input() displayImc: number | null = null;
  @Input() imcCategory: string = '';
  @Input() imcCategoryClass: string = '';
}