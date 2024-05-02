import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSelecorComponent } from './view-selecor.component';

describe('ViewSelecorComponent', () => {
  let component: ViewSelecorComponent;
  let fixture: ComponentFixture<ViewSelecorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewSelecorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewSelecorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
