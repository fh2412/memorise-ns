import { Component, OnInit, inject } from '@angular/core';
import { MemoryService } from '@services/memory.service';
import { ActivatedRoute } from '@angular/router';
import { BackButtonComponent } from '../../../components/back-button/back-button.component';
import { ImageUploadComponent } from '../../../components/image-upload/image-upload.component';

@Component({
  selector: 'app-add-photos',
  templateUrl: './add-photos.component.html',
  styleUrls: ['./add-photos.component.scss'],
  imports: [BackButtonComponent, ImageUploadComponent]
})
export class AddPhotosComponent implements OnInit {
  private memoryService = inject(MemoryService);
  private activatedRoute = inject(ActivatedRoute);

  memoryId = 1;
  firebasePath = '';
  pictureCount = 0;
  loaded = false;

  async ngOnInit(): Promise<void> {
    this.activatedRoute.params.subscribe(params => {
      this.memoryId = +params['id'] || this.memoryId;
      this.loadMemory();
    });
  }

  loadMemory(): void {
    this.memoryService.getMemory(this.memoryId).subscribe(
      response => {
        this.firebasePath = response.image_url;
        this.pictureCount = response.picture_count || 0;
        this.loaded = true;
        console.log("Memory data loaded:", response);
      },
      error => {
        console.error('Error loading memory:', error);
      }
    );
  }
}
