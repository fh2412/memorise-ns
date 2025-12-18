import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionStatusComponent } from './subscription-status.component';

describe('SubscriptionStatusComponent', () => {
  let component: SubscriptionStatusComponent;
  let fixture: ComponentFixture<SubscriptionStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
