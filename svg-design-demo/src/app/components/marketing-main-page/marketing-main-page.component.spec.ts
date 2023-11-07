import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketingMainPageComponent } from './marketing-main-page.component';

describe('MarketingMainPageComponent', () => {
  let component: MarketingMainPageComponent;
  let fixture: ComponentFixture<MarketingMainPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarketingMainPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketingMainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
