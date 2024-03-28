import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetaLandingpageComponent } from './beta-landingpage.component';

describe('BetaLandingpageComponent', () => {
  let component: BetaLandingpageComponent;
  let fixture: ComponentFixture<BetaLandingpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BetaLandingpageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BetaLandingpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
