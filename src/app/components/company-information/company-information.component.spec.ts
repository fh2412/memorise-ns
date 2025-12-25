import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyInformationComponent } from './company-information.component';

describe('CompanyInformationComponent', () => {
  let component: CompanyInformationComponent;
  let fixture: ComponentFixture<CompanyInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [CompanyInformationComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(CompanyInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
