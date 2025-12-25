import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddingMemoryComponent } from './adding-memory.component';

describe('AddingMemoryComponent', () => {
  let component: AddingMemoryComponent;
  let fixture: ComponentFixture<AddingMemoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [AddingMemoryComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(AddingMemoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
