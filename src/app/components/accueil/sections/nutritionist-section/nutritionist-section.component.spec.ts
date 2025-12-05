import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NutritionistSectionComponent } from './nutritionist-section.component';

describe('NutritionistSectionComponent', () => {
  let component: NutritionistSectionComponent;
  let fixture: ComponentFixture<NutritionistSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NutritionistSectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NutritionistSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
