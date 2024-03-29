import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DialogData {
  name: string;
  bio: string;
  dob: string;
  gender: string;
  country: string;
}

@Component({
  // Component metadata
  selector: 'edit-user-dialog',
  templateUrl: 'edit-user-dialog.component.html',
  styleUrls: ['edit-user-dialog.component.css']
})
export class EditUserDialogComponent {
  @Output() updateUserData = new EventEmitter<any>();
  userForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public userdata: DialogData, private fb: FormBuilder) {
      this.userForm = this.fb.group({
        name: userdata.name,
        bio: userdata.bio,
        dob: userdata.dob,
        gender: userdata.gender,
        location: userdata.country,
      });
    }

  saveChanges() {
    const updatedUserData = this.userForm.value;
    this.updateUserData.emit(updatedUserData);
    this.dialogRef.close();
    window.location.reload();
  }
}
