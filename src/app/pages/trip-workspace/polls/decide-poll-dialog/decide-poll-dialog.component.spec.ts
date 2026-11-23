import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecidePollDialogComponent } from './decide-poll-dialog.component';

describe('DecidePollDialogComponent', () => {
  let component: DecidePollDialogComponent;
  let fixture: ComponentFixture<DecidePollDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecidePollDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecidePollDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
