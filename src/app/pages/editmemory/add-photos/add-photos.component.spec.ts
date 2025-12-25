import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPhotosComponent } from './add-photos.component';

describe('AddPhotosComponent', () => {
  let component: AddPhotosComponent;
  let fixture: ComponentFixture<AddPhotosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [AddPhotosComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(AddPhotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
