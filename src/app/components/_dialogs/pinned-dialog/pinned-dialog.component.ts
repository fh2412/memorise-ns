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
  filterMemories: Memory[] = [];
  initFavoriteMemories: Memory[] = [];
  searchText = '';
  selectableCount = 4;
  selectedCount = 0;
  hasChangesBool: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<PinnedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { memories: any[], pinned: any[] }
  ) {
    this.favoriteMemories = this.data.pinned.map(memory => ({
      name: memory.title,
      id: memory.memory_id,
      isFavorite: true,
    }));
    this.initFavoriteMemories = this.data.pinned.map(memory => ({
      name: memory.title,
      id: memory.memory_id,
      isFavorite: true,
    }));
    this.allMemories = this.data.memories.map(memory => ({
      name: memory.title,
      id: memory.memoryId,
      isFavorite: false,
    }));
    this.allMemories = this.allMemories.filter(
      memory => !this.favoriteMemories.some(favorite => favorite.id === memory.id)
    );
    this.selectedCount = this.favoriteMemories.length;
    this.filterMemories = this.allMemories;
  }

  updateSearch(value: any) {
    const searchText = value.target.value.toLowerCase();

    if (searchText) {
      // Filter memories based on the search text
      this.filterMemories = this.allMemories.filter(memory =>
        memory.name.toLowerCase().includes(searchText)
      );
    } else {
      // Reset to the original array if the search text is empty
      this.filterMemories = [...this.allMemories];
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
      this.filterMemories = [...this.allMemories];
    }
  }

  addAllMemories(memory: Memory) {
    this.allMemories.push(memory);
    this.filterMemories = [...this.allMemories];
  }

  getRemainingSelections() {
    return this.selectableCount - this.selectedCount;
  }

  updateSaveButton() {
    this.hasChangesBool = !this.hasChanges();
  }

  hasChanges() {
    return JSON.stringify(this.favoriteMemories) == JSON.stringify(this.initFavoriteMemories);
  }

  onSave() {
    this.dialogRef.close(this.favoriteMemories);
  }
}
