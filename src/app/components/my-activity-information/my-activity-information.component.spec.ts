import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyActivityInformationComponent } from './my-activity-information.component';

describe('MyActivityInformationComponent', () => {
  let component: MyActivityInformationComponent;
  let fixture: ComponentFixture<MyActivityInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyActivityInformationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyActivityInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
