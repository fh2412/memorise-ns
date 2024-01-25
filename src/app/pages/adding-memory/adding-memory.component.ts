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
  emailArray: any;
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

  onSelectedValuesChange(selectedValues: string[]) {
    // Do something with the selected values
    
    this.emailArray = selectedValues.map(str => str.match(/\(([^)]+)\)/)?.[1] || null).filter(email => email !== null);
    console.log(this.emailArray);
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

}
