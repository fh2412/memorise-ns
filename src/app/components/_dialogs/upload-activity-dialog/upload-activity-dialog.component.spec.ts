import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadActivityDialogComponent } from './upload-activity-dialog.component';

describe('UploadActivityDialogComponent', () => {
  let component: UploadActivityDialogComponent;
  let fixture: ComponentFixture<UploadActivityDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadActivityDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadActivityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
