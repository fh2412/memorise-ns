import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiashowComponent } from './diashow.component';

describe('DiashowComponent', () => {
  let component: DiashowComponent;
  let fixture: ComponentFixture<DiashowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiashowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiashowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
