import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BockmarkedActivitiesComponent } from './bockmarked-activities.component';

describe('BockmarkedActivitiesComponent', () => {
  let component: BockmarkedActivitiesComponent;
  let fixture: ComponentFixture<BockmarkedActivitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BockmarkedActivitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BockmarkedActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
