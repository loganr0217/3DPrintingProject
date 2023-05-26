import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderFailureComponent } from './order-failure.component';

describe('OrderFailureComponent', () => {
  let component: OrderFailureComponent;
  let fixture: ComponentFixture<OrderFailureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderFailureComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderFailureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
