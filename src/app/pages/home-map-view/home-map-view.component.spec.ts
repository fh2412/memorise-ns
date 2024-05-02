import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeMapViewComponent } from './home-map-view.component';

describe('HomeMapViewComponent', () => {
  let component: HomeMapViewComponent;
  let fixture: ComponentFixture<HomeMapViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeMapViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HomeMapViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
