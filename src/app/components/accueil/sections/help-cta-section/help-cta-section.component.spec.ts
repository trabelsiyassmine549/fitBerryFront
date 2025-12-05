import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpCtaSectionComponent } from './help-cta-section.component';

describe('HelpCtaSectionComponent', () => {
  let component: HelpCtaSectionComponent;
  let fixture: ComponentFixture<HelpCtaSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HelpCtaSectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpCtaSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
