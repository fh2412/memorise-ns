import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-full-description-dialog',
    templateUrl: './full-description-dialog.component.html',
    styleUrls: ['./full-description-dialog.component.scss'],
    imports: [
      MatButtonModule,
      MatDialogModule,
      MatIconModule
    ]
})
export class FullDescriptionDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { description: string }) { }
}
