import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatIsSectionComponent } from './what-is-section.component';

describe('WhatIsSectionComponent', () => {
  let component: WhatIsSectionComponent;
  let fixture: ComponentFixture<WhatIsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WhatIsSectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatIsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
