import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditmemoryComponent } from './editmemory.component';

describe('EditmemoryComponent', () => {
  let component: EditmemoryComponent;
  let fixture: ComponentFixture<EditmemoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [EditmemoryComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(EditmemoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
