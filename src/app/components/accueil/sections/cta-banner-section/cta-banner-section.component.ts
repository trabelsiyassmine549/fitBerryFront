import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
 selector: 'app-cta-banner-section',
 standalone: true, 
 imports: [],      
 templateUrl: './cta-banner-section.component.html',
 styleUrls: ['./cta-banner-section.component.css']
})
export class CtaBannerSectionComponent {

 constructor(private router: Router) {} 


navigate(path: string) {
 this.router.navigate([path]);
 }
}