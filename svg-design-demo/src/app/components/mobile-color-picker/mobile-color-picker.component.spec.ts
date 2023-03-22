import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileColorPickerComponent } from './mobile-color-picker.component';

describe('MobileColorPickerComponent', () => {
  let component: MobileColorPickerComponent;
  let fixture: ComponentFixture<MobileColorPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MobileColorPickerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileColorPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
