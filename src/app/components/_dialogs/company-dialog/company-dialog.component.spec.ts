import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyDialogComponent } from './company-dialog.component';

describe('CompanyDialogComponent', () => {
  let component: CompanyDialogComponent;
  let fixture: ComponentFixture<CompanyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CompanyDialogComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(CompanyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
