import { Component } from '@angular/core';
import { Router } from '@angular/router'; 

@Component({
 selector: 'app-help-cta-section',
 standalone: true, 
 imports: [],      
 templateUrl: './help-cta-section.component.html',
 styleUrls: ['./help-cta-section.component.css']
})
export class HelpCtaSectionComponent {

 constructor(private router: Router) {} 


navigate(path: string) {
 this.router.navigate([path]);
 }
}