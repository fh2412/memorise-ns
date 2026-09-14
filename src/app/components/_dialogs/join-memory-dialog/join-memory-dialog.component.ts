import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

export interface PlaceholderItem {
  id: string;
  name: string;
}

export interface JoinMemoryDialogData {
  tripTitle: string;
  placeholders: PlaceholderItem[];
}

@Component({
  selector: 'app-join-memory-dialog',
  templateUrl: './join-memory-dialog.component.html',
  styleUrls: ['./join-memory-dialog.component.scss'],
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatRippleModule
  ]
})
export class JoinMemoryDialogComponent {
  readonly data = inject<JoinMemoryDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<JoinMemoryDialogComponent>);

  // Signal for reactive selection state (null = fresh join)
  readonly selectedId = signal<string | null>(null);

  selectOption(id: string | null): void {
    this.selectedId.set(id);
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }

  confirm(): void {
    this.dialogRef.close(this.selectedId());
  }

  // Get initial for avatar fallback
  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }
}