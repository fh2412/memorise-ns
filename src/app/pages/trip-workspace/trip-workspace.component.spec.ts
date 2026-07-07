import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripWorkspaceComponent } from './trip-workspace.component';

describe('TripWorkspaceComponent', () => {
  let component: TripWorkspaceComponent;
  let fixture: ComponentFixture<TripWorkspaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripWorkspaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
