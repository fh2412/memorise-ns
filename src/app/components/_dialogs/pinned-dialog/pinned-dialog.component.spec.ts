import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinnedDialogComponent } from './pinned-dialog.component';

describe('PinnedDialogComponent', () => {
  let component: PinnedDialogComponent;
  let fixture: ComponentFixture<PinnedDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [PinnedDialogComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(PinnedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
