import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetMemoriesActivityComponent } from './set-memories-activity.component';

describe('SetMemoriesActivityComponent', () => {
  let component: SetMemoriesActivityComponent;
  let fixture: ComponentFixture<SetMemoriesActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [SetMemoriesActivityComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(SetMemoriesActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
