import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturesGridSectionComponent } from './features-grid-section.component';

describe('FeaturesGridSectionComponent', () => {
  let component: FeaturesGridSectionComponent;
  let fixture: ComponentFixture<FeaturesGridSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeaturesGridSectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturesGridSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
