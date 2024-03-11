import { Component, Input } from '@angular/core';
import { MemoryService } from '../../services/memory.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FileUploadService } from '../../services/file-upload.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-editmemory',
  templateUrl: './editmemory.component.html',
  styleUrl: './editmemory.component.scss'
})
export class EditmemoryComponent {
  memoryId: string = '';
  memory: any;
  firebaseId: string = '';
  memoryForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private router: Router, private route: ActivatedRoute, private memoryService: MemoryService, private firebaseService: FileUploadService) {
    this.memoryForm = this.formBuilder.group({
      description: [''],
    });
  }

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

  addPhotos(){
    console.log("Add Photos!");
  }

  getMemory() {
    this.memoryService.getMemory(this.memoryId).subscribe(
      (response) => {
        this.firebaseId = response.image_url;
        this.memory = response;
        this.memoryForm.patchValue({
          description: this.memory.text,
        });
      },
      (error) => {
        console.error('Error getting memory:', error);
      }
    );
  }
}
