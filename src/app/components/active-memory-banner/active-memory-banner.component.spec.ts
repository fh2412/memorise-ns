import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveMemoryBannerComponent } from './active-memory-banner.component';

describe('ActiveMemoryBannerComponent', () => {
  let component: ActiveMemoryBannerComponent;
  let fixture: ComponentFixture<ActiveMemoryBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveMemoryBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveMemoryBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
