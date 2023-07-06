import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealerPageComponent } from './dealer-page.component';

describe('DealerPageComponent', () => {
  let component: DealerPageComponent;
  let fixture: ComponentFixture<DealerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DealerPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DealerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
