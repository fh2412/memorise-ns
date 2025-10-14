import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinMemoryDialogComponent } from './join-memory-dialog.component';

describe('JoinMemoryDialogComponent', () => {
  let component: JoinMemoryDialogComponent;
  let fixture: ComponentFixture<JoinMemoryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinMemoryDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinMemoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
