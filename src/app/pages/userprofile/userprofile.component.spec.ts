import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenlinkComponent } from './userprofile.component';

describe('OpenlinkComponent', () => {
  let component: OpenlinkComponent;
  let fixture: ComponentFixture<OpenlinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpenlinkComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OpenlinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
