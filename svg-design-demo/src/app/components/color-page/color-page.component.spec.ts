import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorPageComponent } from './color-page.component';

describe('ColorPageComponent', () => {
  let component: ColorPageComponent;
  let fixture: ComponentFixture<ColorPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColorPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
