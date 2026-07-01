import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrewAvatarComponent } from './crew-avatar.component';

describe('CrewAvatarComponent', () => {
  let component: CrewAvatarComponent;
  let fixture: ComponentFixture<CrewAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrewAvatarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrewAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
