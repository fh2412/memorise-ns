import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DialogData {
  instagram: string;
  name: string;
  bio: string;
  dob: string;
  gender: string;
  country: string;
  username: string;
}

@Component({
  // Component metadata
  selector: 'edit-user-dialog',
  templateUrl: 'edit-user-dialog.component.html',
  styleUrls: ['edit-user-dialog.component.scss']
})
export class EditUserDialogComponent {
  @Output() updateUserData = new EventEmitter<any>();
  userForm: FormGroup;

  constructor(private datePipe: DatePipe, public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public userdata: DialogData, private fb: FormBuilder) {
      this.userForm = this.fb.group({
        name: userdata.name,
        bio: userdata.bio,
        dob: userdata.dob,
        gender: userdata.gender,
        country: userdata.country,
        username: userdata.username,
        instagram: userdata.instagram
      });
      console.log(this.userForm.value);
    }

  saveChanges() {
    this.userForm.value.dob = this.datePipe.transform(this.userForm.value.dob, 'dd/MM/yyyy');
    const updatedUserData = this.userForm.value;
    this.updateUserData.emit(updatedUserData);
    //this.dialogRef.close();
  }
}
