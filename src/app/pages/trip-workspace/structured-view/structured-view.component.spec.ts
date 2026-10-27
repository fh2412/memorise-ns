import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructuredViewComponent } from './structured-view.component';

describe('StructuredViewComponent', () => {
  let component: StructuredViewComponent;
  let fixture: ComponentFixture<StructuredViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructuredViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StructuredViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
