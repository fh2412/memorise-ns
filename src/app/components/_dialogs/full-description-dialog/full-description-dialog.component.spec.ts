import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullDescriptionDialogComponent } from './full-description-dialog.component';

describe('FullDescriptionDialogComponent', () => {
  let component: FullDescriptionDialogComponent;
  let fixture: ComponentFixture<FullDescriptionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [FullDescriptionDialogComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(FullDescriptionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
