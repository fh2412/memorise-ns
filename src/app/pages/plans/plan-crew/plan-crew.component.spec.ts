import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanCrewComponent } from './plan-crew.component';

describe('PlanCrewComponent', () => {
  let component: PlanCrewComponent;
  let fixture: ComponentFixture<PlanCrewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanCrewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanCrewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
