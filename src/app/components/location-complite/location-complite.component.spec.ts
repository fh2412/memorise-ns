import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationCompliteComponent } from './location-complite.component';

describe('LocationCompliteComponent', () => {
  let component: LocationCompliteComponent;
  let fixture: ComponentFixture<LocationCompliteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationCompliteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationCompliteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
