import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface Memory {
  name: string;
  id: number;
  isFavorite: boolean;
}

@Component({
  selector: 'app-pinned-dialog',
  templateUrl: './pinned-dialog.component.html',
  styleUrl: './pinned-dialog.component.scss'
})
export class PinnedDialogComponent {
  favoriteMemories: Memory[] = [];
  allMemories: Memory[] = [];
  searchText = '';
  selectableCount = 4;
  selectedCount = 0;

  constructor(
    public dialogRef: MatDialogRef<PinnedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { memories: any[], pinned: any[] }
  ) {
    this.favoriteMemories = this.data.pinned.map(memory => ({
      name: memory.title,
      id: memory.memory_id,
      isFavorite: true,
    }));
    this.allMemories = this.data.memories.map(memory => ({
      name: memory.title,
      id: memory.memoryId,
      isFavorite: false,
    }));
    this.selectedCount = this.favoriteMemories.length;
  }

  updateSearch(value: any) {
    if (value) {
      this.searchText = value.target.value;
    }
  }

  updateSelection(memory: Memory, event: any) {
    memory.isFavorite = event.checked;
    if (memory.isFavorite && this.selectedCount < 4) {
      this.favoriteMemories.push(memory);
      this.removeFromAllMemories(memory);
    } else {
      this.removeFromFavoriteMemories(memory);
      this.addAllMemories(memory);
    }
    this.updateSaveButton();
    this.selectedCount = this.favoriteMemories.length;
  }

  removeFromFavoriteMemories(memory: Memory) {
    const index = this.favoriteMemories.findIndex(m => m.id === memory.id);
    if (index > -1) {
      this.favoriteMemories.splice(index, 1);
    }
  }

  removeFromAllMemories(memory: Memory) {
    const index = this.allMemories.findIndex(m => m.id === memory.id);
    if (index > -1) {
      this.allMemories.splice(index, 1);
    }
  }

  addAllMemories(memory: Memory) {
    this.allMemories.push(memory);
  }

  getRemainingSelections() {
    return this.selectableCount - this.selectedCount;
  }

  updateSaveButton() {
    this.dialogRef.disableClose = !this.hasChanges();
  }

  hasChanges() {
    return this.favoriteMemories.some(memory => !memory.isFavorite) ||
      this.allMemories.some(memory => memory.isFavorite);
  }

  onSave() {
    this.dialogRef.close(this.favoriteMemories);
  }
}
