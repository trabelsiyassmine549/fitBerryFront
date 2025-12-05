import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';  // ← Add this import

@Component({
  selector: 'app-root',
  standalone: true,  // ← Add this
  imports: [RouterOutlet],  // ← Add this (you can add more imports here if needed, e.g., CommonModule)
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'fitberry-front';
}
