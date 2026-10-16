import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageLimitDialogComponent } from './storage-limit-dialog.component';

describe('StorageLimitDialogComponent', () => {
  let component: StorageLimitDialogComponent;
  let fixture: ComponentFixture<StorageLimitDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorageLimitDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StorageLimitDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
