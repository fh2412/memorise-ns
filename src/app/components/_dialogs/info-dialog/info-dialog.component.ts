import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface InfoDialogData {
  text: string;
  buttonText: string;
}

@Component({
    selector: 'app-info-dialog',
    templateUrl: './info-dialog.component.html',
    styleUrls: ['./info-dialog.component.scss'],
    imports: [
      MatButtonModule,
      MatDialogModule
    ]
})
export class InfoDialogComponent {
  dialogRef = inject<MatDialogRef<InfoDialogComponent>>(MatDialogRef);
  data = inject<InfoDialogData>(MAT_DIALOG_DATA);


  onCloseClick(): void {
    this.dialogRef.close();
  }
}
