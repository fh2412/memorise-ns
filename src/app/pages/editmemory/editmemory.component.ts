import { Component, Input } from '@angular/core';
import { MemoryService } from '../../services/memory.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'app-editmemory',
  templateUrl: './editmemory.component.html',
  styleUrl: './editmemory.component.css'
})
export class EditmemoryComponent {
  memoryId: string = '';
  firebaseId: string = '';

  constructor(private router: Router, private route: ActivatedRoute, private memoryService: MemoryService, private firebaseService: FileUploadService) {}

  async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe((params) => {
      this.memoryId = params.get('id')!;
    });
    await this.getMemory();
  }

  deleteMemory() {
    console.log("got firebase ID", this.firebaseId);
    this.memoryService.deleteMemoryAndFriends(this.memoryId).subscribe(
      (response) => {
        console.log('Memory and friends deleted successfully:', response);
        this.firebaseService.deleteMemorysFolder(this.firebaseId)
        .subscribe(
          () => {
            console.log('Folder deleted successfully.');
          },
          (error) => {
            console.error('Error deleting folder:', error);
          }
        );
      },
      (error) => {
        console.error('Error deleting memory and friends:', error);
        // Handle error, e.g., show an error message
      }
    );
    this.router.navigate(['/home']);
  }

  getMemory() {
    this.memoryService.getMemory(this.memoryId).subscribe(
      (response) => {
        this.firebaseId = response.image_url;
      },
      (error) => {
        console.error('Error getting memory:', error);
      }
    );
  }
}
