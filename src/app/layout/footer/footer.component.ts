import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; 
import { CommonModule } from '@angular/common';

@Component({
 selector: 'app-footer',
 standalone: true, 
 imports: [
 CommonModule,   
 RouterLink    
 ],
 templateUrl: './footer.component.html',
 styleUrls: ['./footer.component.css']
})
export class FooterComponent {
constructor(private router: Router) {}

 navigate(path: string) {
 this.router.navigate([path]);
 }
}