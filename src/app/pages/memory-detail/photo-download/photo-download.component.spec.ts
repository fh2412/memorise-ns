import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoDownloadComponent } from './photo-download.component';

describe('PhotoDownloadComponent', () => {
  let component: PhotoDownloadComponent;
  let fixture: ComponentFixture<PhotoDownloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [PhotoDownloadComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(PhotoDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
