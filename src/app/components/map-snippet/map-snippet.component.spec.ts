import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapSnippetComponent } from './map-snippet.component';

describe('MapSnippetComponent', () => {
  let component: MapSnippetComponent;
  let fixture: ComponentFixture<MapSnippetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [MapSnippetComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(MapSnippetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
