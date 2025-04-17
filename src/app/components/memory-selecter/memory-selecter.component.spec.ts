import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemorySelecterComponent } from './memory-selecter.component';

describe('MemorySelecterComponent', () => {
  let component: MemorySelecterComponent;
  let fixture: ComponentFixture<MemorySelecterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MemorySelecterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemorySelecterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
