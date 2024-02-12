import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingMainPageComponent } from './shopping-main-page.component';

describe('ShoppingMainPageComponent', () => {
  let component: ShoppingMainPageComponent;
  let fixture: ComponentFixture<ShoppingMainPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShoppingMainPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShoppingMainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
