import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngoingRequestsComponent } from './ingoing-requests.component';

describe('IngoingRequestsComponent', () => {
  let component: IngoingRequestsComponent;
  let fixture: ComponentFixture<IngoingRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngoingRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngoingRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
