import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadProgressDialogComponent } from './upload-progress-dialog.component';

describe('UploadProgressDialogComponent', () => {
  let component: UploadProgressDialogComponent;
  let fixture: ComponentFixture<UploadProgressDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [UploadProgressDialogComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadProgressDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
