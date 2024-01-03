import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MomorypreviewComponent } from './momorypreview.component';

describe('MomorypreviewComponent', () => {
  let component: MomorypreviewComponent;
  let fixture: ComponentFixture<MomorypreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MomorypreviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MomorypreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
