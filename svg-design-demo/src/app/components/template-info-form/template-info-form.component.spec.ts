import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateInfoFormComponent } from './template-info-form.component';

describe('TemplateInfoFormComponent', () => {
  let component: TemplateInfoFormComponent;
  let fixture: ComponentFixture<TemplateInfoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplateInfoFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateInfoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
