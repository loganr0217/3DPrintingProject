import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateFilterShoppingComponent } from './template-filter-shopping.component';

describe('TemplateFilterShoppingComponent', () => {
  let component: TemplateFilterShoppingComponent;
  let fixture: ComponentFixture<TemplateFilterShoppingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplateFilterShoppingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplateFilterShoppingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
