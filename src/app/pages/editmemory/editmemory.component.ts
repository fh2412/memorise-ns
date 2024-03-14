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
  isFormChanged: boolean = true;
  emailArray: any;
  newFriends: boolean = true;

  constructor(private formBuilder: FormBuilder, private router: Router, private route: ActivatedRoute, private memoryService: MemoryService, private firebaseService: FileUploadService) {
    this.memoryForm = this.formBuilder.group({
      description: [''],
      title: [''],
      memory_date: [''],
      memory_end_date: [''],
    });
  }

  async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe((params) => {
      this.memoryId = params.get('id')!;
    });
    await this.getMemory();
    //this.memoryForm.valueChanges.subscribe(() => {
    //  this.isFormChanged = true;
    //});
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
          title: this.memory.title,
          memory_date: this.memory.memory_date,
          memory_end_date: this.memory.memory_end_date
        });
      },
      (error) => {
        console.error('Error getting memory:', error);
      }
    );
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  saveChanges(): void {
    this.memoryService.updateMemory(this.memoryId, this.memoryForm.value).subscribe(
      (response) => {
        console.log(response); // Handle success response
      },
      (error) => {
        console.error('Error updating memory:', error); // Handle error
      }
    );
    this.router.navigate(['/home']);
  }

  onSelectedValuesChange(selectedValues: string[]) {
    this.emailArray = selectedValues.map(str => str.match(/\(([^)]+)\)/)?.[1] || null).filter(email => email !== null);
    if(this.emailArray.length>0){
      this.newFriends=false;
    }
    else{
      this.newFriends=true;
    }
  }


  async addFriends(): Promise<void>{
    const friendData = { emails: this.emailArray, memoryId: this.memoryId };
    await this.memoryService.addFriendToMemory(friendData).subscribe(
      (friendResponse) => {
        console.log('Friend added to memory successfully:', friendResponse);
        window.location.reload();
      },
      (friendError) => {
        console.error('Error adding friend to memory:', friendError);
        // Handle error (e.g., show an error message to the user)
      }
    );
  }
}
