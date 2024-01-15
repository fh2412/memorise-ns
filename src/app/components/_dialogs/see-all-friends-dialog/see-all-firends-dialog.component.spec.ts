import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeeAllFirendsDialogComponent } from './see-all-firends-dialog.component';

describe('SeeAllFirendsDialogComponent', () => {
  let component: SeeAllFirendsDialogComponent;
  let fixture: ComponentFixture<SeeAllFirendsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SeeAllFirendsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SeeAllFirendsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
