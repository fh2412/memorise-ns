import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinCardComponent } from './pin-card.component';

describe('PinCardComponent', () => {
  let component: PinCardComponent;
  let fixture: ComponentFixture<PinCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PinCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PinCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
