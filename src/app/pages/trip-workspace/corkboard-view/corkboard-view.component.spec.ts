import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorkboardViewComponent } from './corkboard-view.component';

describe('CorkboardViewComponent', () => {
  let component: CorkboardViewComponent;
  let fixture: ComponentFixture<CorkboardViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorkboardViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorkboardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
