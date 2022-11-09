import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorOfferingsPageComponent } from './color-offerings-page.component';

describe('ColorOfferingsPageComponent', () => {
  let component: ColorOfferingsPageComponent;
  let fixture: ComponentFixture<ColorOfferingsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColorOfferingsPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorOfferingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
