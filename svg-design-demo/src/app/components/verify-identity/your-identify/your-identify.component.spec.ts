import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YourIdentifyComponent } from './your-identify.component';

describe('YourIdentifyComponent', () => {
  let component: YourIdentifyComponent;
  let fixture: ComponentFixture<YourIdentifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YourIdentifyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(YourIdentifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
