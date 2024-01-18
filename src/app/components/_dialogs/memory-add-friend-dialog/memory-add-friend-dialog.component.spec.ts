import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoryAddFriendDialogComponent } from './memory-add-friend-dialog.component';

describe('MemoryAddFriendDialogComponent', () => {
  let component: MemoryAddFriendDialogComponent;
  let fixture: ComponentFixture<MemoryAddFriendDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MemoryAddFriendDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MemoryAddFriendDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
