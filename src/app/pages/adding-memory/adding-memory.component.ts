import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

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
  openAddFriendsDialog(): void {
    // Logic to open dialog for adding friends
    // Use MatDialog to open a dialog for selecting friends
  }
}
