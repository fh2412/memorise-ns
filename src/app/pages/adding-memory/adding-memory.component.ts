import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MemoryAddFriendDialogComponent } from '../../components/_dialogs/memory-add-friend-dialog/memory-add-friend-dialog.component';

@Component({
  selector: 'app-adding-memory',
  templateUrl: './adding-memory.component.html',
  styleUrl: './adding-memory.component.css'
})
export class AddingMemoryComponent {  
  memoryDetailsForm = this.formBuilder.group({
    detailsCtrl: ['', Validators.required],
  });
  memoryPicturesForm = this.formBuilder.group({
    firstCtrl: ['', Validators.required],
  });

  constructor(private formBuilder: FormBuilder, public dialog: MatDialog) {}


  uploadMedia(): void {
    // Placeholder method for media upload
    // Implement media upload logic here
    console.log('Media upload method called');
  }
  openAddFriendDialog() {
    const dialogRef = this.dialog.open(MemoryAddFriendDialogComponent, {
      width: '400px', // Adjust the width as needed
    });

    // You can subscribe to the afterClosed event to perform actions when the dialog is closed
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
