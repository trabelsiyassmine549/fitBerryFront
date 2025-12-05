import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoriesSectionComponent } from './stories-section.component';

describe('StoriesSectionComponent', () => {
  let component: StoriesSectionComponent;
  let fixture: ComponentFixture<StoriesSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StoriesSectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoriesSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
