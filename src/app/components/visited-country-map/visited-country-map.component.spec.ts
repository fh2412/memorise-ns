import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitedCountryMapComponent } from './visited-country-map.component';

describe('VisitedCountryMapComponent', () => {
  let component: VisitedCountryMapComponent;
  let fixture: ComponentFixture<VisitedCountryMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitedCountryMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitedCountryMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
