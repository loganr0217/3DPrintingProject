import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WindowPreviewContainerComponent } from './window-preview-container.component';

describe('WindowPreviewContainerComponent', () => {
  let component: WindowPreviewContainerComponent;
  let fixture: ComponentFixture<WindowPreviewContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WindowPreviewContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WindowPreviewContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
