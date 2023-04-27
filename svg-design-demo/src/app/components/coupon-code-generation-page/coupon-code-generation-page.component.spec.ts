import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponCodeGenerationPageComponent } from './coupon-code-generation-page.component';

describe('CouponCodeGenerationPageComponent', () => {
  let component: CouponCodeGenerationPageComponent;
  let fixture: ComponentFixture<CouponCodeGenerationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CouponCodeGenerationPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CouponCodeGenerationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
