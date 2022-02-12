import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateSelectionContainerComponent } from './template-selection-container.component';

describe('TemplateSelectionContainerComponent', () => {
  let component: TemplateSelectionContainerComponent;
  let fixture: ComponentFixture<TemplateSelectionContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplateSelectionContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateSelectionContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
