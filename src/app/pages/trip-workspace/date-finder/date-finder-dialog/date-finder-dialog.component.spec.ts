import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateFinderDialogComponent } from './date-finder-dialog.component';

describe('DateFinderDialogComponent', () => {
  let component: DateFinderDialogComponent;
  let fixture: ComponentFixture<DateFinderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateFinderDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateFinderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
