import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 


import { HeroSectionComponent } from './sections/hero-section/hero-section.component';
import { BenefitsSectionComponent } from './sections/benefits-section/benefits-section.component';
import { FeaturesGridSectionComponent } from './sections/features-grid-section/features-grid-section.component';
import { WhatIsSectionComponent } from './sections/what-is-section/what-is-section.component';
import { CostBannerSectionComponent } from './sections/cost-banner-section/cost-banner-section.component';
import { NutritionistSectionComponent } from './sections/nutritionist-section/nutritionist-section.component';
import { StoriesSectionComponent } from './sections/stories-section/stories-section.component';
import { CtaBannerSectionComponent } from './sections/cta-banner-section/cta-banner-section.component';
import { HelpCtaSectionComponent } from './sections/help-cta-section/help-cta-section.component';


import { NavbarComponent } from '../../layout/navbar-acceuil/navbar.component';
import { FooterComponent } from '../../layout/footer/footer.component';

@Component({
 selector: 'app-accueil',
 standalone: true,
 imports: [
    CommonModule, 

 HeroSectionComponent,
 BenefitsSectionComponent,
 FeaturesGridSectionComponent,
 WhatIsSectionComponent,
 CostBannerSectionComponent,
 NutritionistSectionComponent,
 StoriesSectionComponent,
 CtaBannerSectionComponent,
 HelpCtaSectionComponent,
 

 NavbarComponent,
 FooterComponent
 ],
 templateUrl: './accueil.component.html',
 styleUrls: ['./accueil.component.css']
})
export class AccueilComponent {

 isMenuOpen = false;

 constructor(private router: Router) {}

 navigate(path: string) {
 this.router.navigate([path]);
 this.isMenuOpen = false;
 }
}