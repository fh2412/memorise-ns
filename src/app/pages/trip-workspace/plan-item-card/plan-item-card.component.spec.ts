import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanItemCardComponent } from './plan-item-card.component';

describe('PlanItemCardComponent', () => {
  let component: PlanItemCardComponent;
  let fixture: ComponentFixture<PlanItemCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanItemCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanItemCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
