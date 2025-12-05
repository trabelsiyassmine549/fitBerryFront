import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostBannerSectionComponent } from './cost-banner-section.component';

describe('CostBannerSectionComponent', () => {
  let component: CostBannerSectionComponent;
  let fixture: ComponentFixture<CostBannerSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CostBannerSectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CostBannerSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
