import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinMemoryPageComponent } from './join-memory-page.component';

describe('JoinMemoryPageComponent', () => {
  let component: JoinMemoryPageComponent;
  let fixture: ComponentFixture<JoinMemoryPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinMemoryPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinMemoryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
