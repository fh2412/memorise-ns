import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollBodyComponent } from './poll-body.component';

describe('PollBodyComponent', () => {
  let component: PollBodyComponent;
  let fixture: ComponentFixture<PollBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollBodyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PollBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
