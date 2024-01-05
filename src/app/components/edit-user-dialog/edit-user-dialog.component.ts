import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DialogData {
  name: string;
  email: string;
}

@Component({
  // Component metadata
  selector: 'edit-user-dialog',
  templateUrl: 'edit-user-dialog.component.html',
})
export class EditUserDialogComponent {
  constructor(public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public userdata: DialogData,) {}

  saveChanges() {
    // Save changes logic, for example, update the user's data
    // You may want to call a service to update the user information
    // For example:
    // this.userService.updateUser(this.user).subscribe(() => {
    //   this.dialogRef.close();
    // });
    this.dialogRef.close(); // Close the dialog after saving
  }
}
