import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomOrderPageComponent } from './custom-order-page.component';

describe('CustomOrderPageComponent', () => {
  let component: CustomOrderPageComponent;
  let fixture: ComponentFixture<CustomOrderPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomOrderPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomOrderPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
