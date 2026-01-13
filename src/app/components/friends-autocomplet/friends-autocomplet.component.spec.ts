import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendsAutocompletComponent } from './friends-autocomplet.component';

describe('FriendsAutocompletComponent', () => {
  let component: FriendsAutocompletComponent;
  let fixture: ComponentFixture<FriendsAutocompletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [FriendsAutocompletComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(FriendsAutocompletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
