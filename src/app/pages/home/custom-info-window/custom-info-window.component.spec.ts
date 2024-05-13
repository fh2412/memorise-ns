import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomInfoWindowComponent } from './custom-info-window.component';

describe('CustomInfoWindowComponent', () => {
  let component: CustomInfoWindowComponent;
  let fixture: ComponentFixture<CustomInfoWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomInfoWindowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomInfoWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
