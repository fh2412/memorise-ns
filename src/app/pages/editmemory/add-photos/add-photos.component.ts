import { Component, OnInit } from '@angular/core';
import { MemoryService } from '../../../services/memory.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-add-photos',
    templateUrl: './add-photos.component.html',
    styleUrls: ['./add-photos.component.scss'] // Corrected to styleUrls for an array
    ,
    standalone: false
})
export class AddPhotosComponent implements OnInit {
  memoryId = 1;
  firebasePath = ''; // Type as string if you expect a URL string
  pictureCount = 0;
  loaded = false;

  constructor(
    private memoryService: MemoryService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.memoryId = +params['id'] || this.memoryId; // Ensures memoryId is a number
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
