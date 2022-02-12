import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorsContainerComponent } from './colors-container.component';

describe('ColorsContainerComponent', () => {
  let component: ColorsContainerComponent;
  let fixture: ComponentFixture<ColorsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColorsContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
