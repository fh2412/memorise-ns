import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityBottomSheetComponent } from './activity-bottom-sheet.component';

describe('ActivityBottomSheetComponent', () => {
  let component: ActivityBottomSheetComponent;
  let fixture: ComponentFixture<ActivityBottomSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityBottomSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityBottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
