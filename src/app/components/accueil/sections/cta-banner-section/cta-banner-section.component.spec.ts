import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CtaBannerSectionComponent } from './cta-banner-section.component';

describe('CtaBannerSectionComponent', () => {
  let component: CtaBannerSectionComponent;
  let fixture: ComponentFixture<CtaBannerSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CtaBannerSectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CtaBannerSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
