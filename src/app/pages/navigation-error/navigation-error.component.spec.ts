import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationErrorComponent } from './navigation-error.component';

describe('NavigationErrorComponent', () => {
  let component: NavigationErrorComponent;
  let fixture: ComponentFixture<NavigationErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationErrorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavigationErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
