import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoosePlanDialogComponent } from './choose-plan-dialog.component';

describe('ChoosePlanDialogComponent', () => {
  let component: ChoosePlanDialogComponent;
  let fixture: ComponentFixture<ChoosePlanDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoosePlanDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChoosePlanDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
