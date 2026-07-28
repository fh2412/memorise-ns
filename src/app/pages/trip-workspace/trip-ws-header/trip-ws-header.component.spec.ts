import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripWsHeaderComponent } from './trip-ws-header.component';

describe('TripWsHeaderComponent', () => {
  let component: TripWsHeaderComponent;
  let fixture: ComponentFixture<TripWsHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripWsHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripWsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
