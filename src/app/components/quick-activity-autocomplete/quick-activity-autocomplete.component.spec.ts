import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickActivityAutocompleteComponent } from './quick-activity-autocomplete.component';

describe('QuickActivityAutocompleteComponent', () => {
  let component: QuickActivityAutocompleteComponent;
  let fixture: ComponentFixture<QuickActivityAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuickActivityAutocompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickActivityAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
