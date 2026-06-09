import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannedMemoryCardComponent } from './planned-memory-card.component';

describe('PlannedMemoryCardComponent', () => {
  let component: PlannedMemoryCardComponent;
  let fixture: ComponentFixture<PlannedMemoryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlannedMemoryCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlannedMemoryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
