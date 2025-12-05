import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
 selector: 'app-hero-section',
 standalone: true, 
 imports: [],      
 templateUrl: './hero-section.component.html',
 styleUrls: ['./hero-section.component.css']
})
export class HeroSectionComponent {

 constructor(private router: Router) {} 


navigate(path: string) {
 this.router.navigate([path]);
 }
}