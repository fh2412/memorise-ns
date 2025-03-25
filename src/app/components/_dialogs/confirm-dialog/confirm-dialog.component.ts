import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { InfoDialogComponent } from '../info-dialog/info-dialog.component';
import { MatButtonModule } from '@angular/material/button';


export interface ConfirmationDialogData {
  title: string;
  message: string;
}

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrl: './confirm-dialog.component.scss',
    imports: [
      MatDialogModule,
      MatButtonModule
    ]
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
