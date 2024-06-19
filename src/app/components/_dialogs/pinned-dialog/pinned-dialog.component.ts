import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface Memory {
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-pinned-dialog',
  templateUrl: './pinned-dialog.component.html',
  styleUrl: './pinned-dialog.component.scss'
})
export class PinnedDialogComponent {
  memories: Memory[];
  searchText = '';
  selectableCount = 4;
  selectedCount = 0;

  constructor(
    public dialogRef: MatDialogRef<PinnedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { memories: Memory[] }
  ) {
    this.memories = this.data.memories.map(memory => ({ ...memory, selected: memory.selected }));
    this.selectedCount = this.memories.filter(memory => memory.selected).length;
  }

  updateSelection(memory: Memory, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    memory.selected = checkbox.checked;
    this.selectedCount = this.memories.filter(memory => memory.selected).length;
    this.updateSaveButton();
  }

  updateSearch(value: string) {
    this.searchText = value;
  }

  updateSaveButton() {
    this.dialogRef.disableClose = !this.hasChanges();
  }

  hasChanges() {
    return JSON.stringify(this.data.memories) !== JSON.stringify(this.memories);
  }

  onSave() {
    this.dialogRef.close(this.memories);
  }

  getRemainingSelections() {
    return this.selectableCount - this.selectedCount;
  }
}
