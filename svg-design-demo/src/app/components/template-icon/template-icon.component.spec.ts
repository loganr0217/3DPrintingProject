import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateIconComponent } from './template-icon.component';

describe('TemplateIconComponent', () => {
  let component: TemplateIconComponent;
  let fixture: ComponentFixture<TemplateIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplateIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
