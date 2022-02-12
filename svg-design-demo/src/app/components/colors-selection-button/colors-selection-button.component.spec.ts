import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorsSelectionButtonComponent } from './colors-selection-button.component';

describe('ColorsSelectionButtonComponent', () => {
  let component: ColorsSelectionButtonComponent;
  let fixture: ComponentFixture<ColorsSelectionButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColorsSelectionButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorsSelectionButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
