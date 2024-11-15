import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MemoriseUser } from '../../../models/userInterface.model';

@Component({
  selector: 'edit-user-dialog',
  templateUrl: 'edit-user-dialog.component.html',
  styleUrls: ['edit-user-dialog.component.scss']
})
export class EditUserDialogComponent {
  @Output() updateUserData = new EventEmitter<MemoriseUser>();  // Emit the full user object
  userForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public userdata: MemoriseUser,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      name: [userdata.name, Validators.required],  // Added validation
      bio: [userdata.bio, Validators.maxLength(500)], // Optional, max length for bio
      dob: [userdata.dob, Validators.required],  // Ensure dob is required
      gender: [userdata.gender, Validators.required],  // Assuming gender is required
      country: [userdata.country, Validators.required],  // Assuming country is required
      username: [userdata.username, Validators.required],
      instagram: [userdata.instagram, Validators.required], // Instagram URL pattern validation
    });
  }

  saveChanges() {
    if (this.userForm.invalid) {
      console.error('Form is invalid');
      return;  // Optionally show an error message
    }

    this.userForm.value.dob.setHours(12, 12, 12, 12);
    this.updateUserData.emit(this.userForm.value);
    this.dialogRef.close();
  }
}
