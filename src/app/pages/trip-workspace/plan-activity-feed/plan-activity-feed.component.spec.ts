import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanActivityFeedComponent } from './plan-activity-feed.component';

describe('PlanActivityFeedComponent', () => {
  let component: PlanActivityFeedComponent;
  let fixture: ComponentFixture<PlanActivityFeedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanActivityFeedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanActivityFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
