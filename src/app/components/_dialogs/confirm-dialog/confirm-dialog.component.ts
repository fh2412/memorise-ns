import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InfoDialogComponent } from '../info-dialog/info-dialog.component';


export interface ConfirmationDialogData {
  title: string;
  message: string;
}

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrl: './confirm-dialog.component.scss',
    standalone: false
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<InfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  onCloseClick(confirmed: boolean): void {
    this.dialogRef.close(confirmed);
  }
}
