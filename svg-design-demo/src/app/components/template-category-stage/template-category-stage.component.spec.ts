import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateCategoryStageComponent } from './template-category-stage.component';

describe('TemplateCategoryStageComponent', () => {
  let component: TemplateCategoryStageComponent;
  let fixture: ComponentFixture<TemplateCategoryStageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplateCategoryStageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateCategoryStageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
