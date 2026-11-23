import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanItemDialogComponent } from './plan-item-dialog.component';

describe('PlanItemDialogComponent', () => {
  let component: PlanItemDialogComponent;
  let fixture: ComponentFixture<PlanItemDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanItemDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanItemDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
