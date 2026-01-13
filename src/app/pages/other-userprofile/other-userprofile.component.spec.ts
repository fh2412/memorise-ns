import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherUserprofileComponent } from './other-userprofile.component';

describe('OtherUserprofileComponent', () => {
  let component: OtherUserprofileComponent;
  let fixture: ComponentFixture<OtherUserprofileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [OtherUserprofileComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(OtherUserprofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
