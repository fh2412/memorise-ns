import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
 
export interface StorageLimitDialogData {
  usedGb: number;
}
 
/** Closes with `'upgrade'` when the user wants to see plans, otherwise `undefined`. */
@Component({
  selector: 'app-storage-limit-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton, MatIcon, DecimalPipe],

  templateUrl: './storage-limit-dialog.component.html',
  styleUrl: './storage-limit-dialog.component.scss',
})
export class StorageLimitDialogComponent {
  protected readonly data = inject<StorageLimitDialogData>(MAT_DIALOG_DATA);
}

