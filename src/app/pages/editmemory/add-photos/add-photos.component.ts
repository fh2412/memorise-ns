import { Component } from '@angular/core';
import { MemoryService } from '../../../services/memory.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-photos',
  templateUrl: './add-photos.component.html',
  styleUrl: './add-photos.component.css'
})
export class AddPhotosComponent {

  constructor(private memoryService: MemoryService, private activatedRoute: ActivatedRoute){}

  memoryId: string = "1";
  firebasePath: any;
  pictureCount: any;

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.memoryId = params['id'];
      console.log("MemoryId:", this.memoryId);
    });
    this.loadMemory();
  }
  loadMemory() {
    this.memoryService.getMemory(this.memoryId).subscribe(
      (response) => {
        this.firebasePath = response.image_url;
        this.pictureCount = response.picture_count;
        console.log("FirebasePath:", this.firebasePath, this.pictureCount);
      },
      (error) => {
        console.error('Error getting memory:', error);
      }
    );
  }
}
