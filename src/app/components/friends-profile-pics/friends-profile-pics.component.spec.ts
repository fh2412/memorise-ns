import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendsProfilePicsComponent } from './friends-profile-pics.component';

describe('FriendsProfilePicsComponent', () => {
  let component: FriendsProfilePicsComponent;
  let fixture: ComponentFixture<FriendsProfilePicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendsProfilePicsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FriendsProfilePicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
