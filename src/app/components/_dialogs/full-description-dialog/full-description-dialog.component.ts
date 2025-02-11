import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-full-description-dialog',
    templateUrl: './full-description-dialog.component.html',
    styleUrls: ['./full-description-dialog.component.scss'],
    standalone: false
})
export class FullDescriptionDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { description: string }) { }
}
