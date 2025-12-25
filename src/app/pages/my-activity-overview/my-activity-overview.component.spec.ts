import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyActivityOverviewComponent } from './my-activity-overview.component';

describe('MyActivityOverviewComponent', () => {
  let component: MyActivityOverviewComponent;
  let fixture: ComponentFixture<MyActivityOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [MyActivityOverviewComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(MyActivityOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
