import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoryDetailComponent } from './memory-detail.component';

describe('MemoryDetailComponent', () => {
  let component: MemoryDetailComponent;
  let fixture: ComponentFixture<MemoryDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MemoryDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MemoryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
