import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignWindowComponent } from './design-window.component';

describe('DesignWindowComponent', () => {
  let component: DesignWindowComponent;
  let fixture: ComponentFixture<DesignWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DesignWindowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
