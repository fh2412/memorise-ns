import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-manage-friends-dialog',
  templateUrl: './manage-friends-dialog.component.html',
  styleUrls: ['./manage-friends-dialog.component.css']
})
export class ManageFriendsDialogComponent {
  constructor(private dialogRef: MatDialogRef<ManageFriendsDialogComponent>) { }

  onSave(): void {
    // You can add save logic here
    this.dialogRef.close();
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
