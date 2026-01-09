import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnlimitedBadgeComponent } from './unlimited-badge.component';

describe('UnlimitedBadgeComponent', () => {
  let component: UnlimitedBadgeComponent;
  let fixture: ComponentFixture<UnlimitedBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnlimitedBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnlimitedBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
