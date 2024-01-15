import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendPreviewComponent } from './friend-preview.component';

describe('FriendPreviewComponent', () => {
  let component: FriendPreviewComponent;
  let fixture: ComponentFixture<FriendPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FriendPreviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FriendPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
