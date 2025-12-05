import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-goals-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './goals-section.component.html',
  styleUrls: ['./goals-section.component.css']
})
export class GoalsSectionComponent {
  @Input() profileForm!: FormGroup;
}