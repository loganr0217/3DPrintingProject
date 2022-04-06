import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DividerWindowComponent } from './divider-window.component';

describe('DividerWindowComponent', () => {
  let component: DividerWindowComponent;
  let fixture: ComponentFixture<DividerWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DividerWindowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DividerWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
