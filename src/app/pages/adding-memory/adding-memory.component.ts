import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MemoryService } from '../../services/memory.service';
import { UserService } from '../../services/userService';

@Component({
  selector: 'app-adding-memory',
  templateUrl: './adding-memory.component.html',
  styleUrl: './adding-memory.component.css'
})
export class AddingMemoryComponent {  

  memoryForm: FormGroup;
  userId: string | null | undefined;
  constructor(private formBuilder: FormBuilder, public dialog: MatDialog, public memoryService: MemoryService, private userService: UserService) {
    this.memoryForm = this.formBuilder.group({
      creator_id: [this.userId], // replace with actual creator ID
      title: ['', Validators.required],
      description: [''],
      firestore_bucket_url: [''],
      location_id: ['456'], // replace with actual location ID
      memory_date: [''], // replace with actual date
    });
  }
  async ngOnInit() {
    await this.userService.userId$.subscribe((userId) => {
      this.userId = userId;
    });
    this.memoryForm.patchValue({ creator_id: this.userId });
  }
  uploadMedia(): void {
    // Placeholder method for media upload
    // Implement media upload logic here
    console.log('Media upload method called');
  }
  /*openAddFriendDialog() {
    const dialogRef = this.dialog.open(MemoryAddFriendDialogComponent, {
      width: '400px', // Adjust the width as needed
    });

    // You can subscribe to the afterClosed event to perform actions when the dialog is closed
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }*/

  createMemory() {
    if (this.memoryForm.valid) {
      const memoryData = this.memoryForm.value;
      console.log(memoryData);
      /*this.memoryService.createMemory(memoryData).subscribe(
        (response) => {
          console.log('Memory created successfully:', response);
          // Handle success (e.g., show a success message to the user)
        },
        (error) => {
          console.error('Error creating memory:', error);
          // Handle error (e.g., show an error message to the user)
        }
      );*/
    } else {
      // Handle form validation errors if needed
      console.error('Form is not valid. Please fill in all required fields.');
    }
  }
}
