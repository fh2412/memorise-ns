import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamesLandingpageComponent } from './games-landingpage.component';

describe('GamesLandingpageComponent', () => {
  let component: GamesLandingpageComponent;
  let fixture: ComponentFixture<GamesLandingpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GamesLandingpageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GamesLandingpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
