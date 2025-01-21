import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Memory } from '../../../models/memoryInterface.model';

export interface PinnedMemory {
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
  favoriteMemories: PinnedMemory[] = [];
  allMemories: PinnedMemory[] = [];
  filteredMemories: PinnedMemory[] = [];
  initialFavoriteMemories: PinnedMemory[] = [];
  searchText = '';
  readonly maxSelectableCount: number = 4;
  hasChangesFlag = false;
  selectedCount = 0;

  constructor(
    public dialogRef: MatDialogRef<PinnedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { memories: Memory[], pinned: Memory[] }
  ) {
    this.initializeMemories();
  }

  private initializeMemories(): void {
    this.favoriteMemories = this.transformMemories(this.data.pinned, true);
    this.initialFavoriteMemories = [...this.favoriteMemories];
    this.allMemories = this.transformMemories(this.data.memories, false)
      .filter(memory => !this.favoriteMemories.some(fav => fav.id === memory.id));
    this.filteredMemories = [...this.allMemories];
    this.selectedCount = this.favoriteMemories.length;
  }

  private transformMemories(memoryData: any[], isFavorite: boolean): PinnedMemory[] {
    return memoryData.map(memory => ({
      name: memory.title,
      id: memory.memory_id || memory.memoryId,
      isFavorite
    }));
  }

  updateSearch(value: string): void {
    const searchText = value.toLowerCase();
    this.filteredMemories = searchText
      ? this.allMemories.filter(memory => memory.name.toLowerCase().includes(searchText))
      : [...this.allMemories];
  }

  updateSelection(memory: PinnedMemory, isSelected: boolean): void {
    memory.isFavorite = isSelected;
    if (isSelected) {
      this.addFavoriteMemory(memory);
      this.selectedCount++;
    } else {
      this.removeFavoriteMemory(memory);
      this.selectedCount--;
    }
    this.updateHasChangesFlag();
  }

  private addFavoriteMemory(memory: PinnedMemory): void {
    if (this.favoriteMemories.length < this.maxSelectableCount) {
      this.favoriteMemories.push(memory);
      this.removeMemoryFromList(memory, this.allMemories);
      this.filteredMemories = [...this.allMemories];
    }
  }

  private removeFavoriteMemory(memory: PinnedMemory): void {
    this.removeMemoryFromList(memory, this.favoriteMemories);
    this.allMemories.push(memory);
    this.filteredMemories = [...this.allMemories];
  }

  private removeMemoryFromList(memory: PinnedMemory, list: PinnedMemory[]): void {
    const index = list.findIndex(m => m.id === memory.id);
    if (index > -1) {
      list.splice(index, 1);
    }
  }

  private updateHasChangesFlag(): void {
    this.hasChangesFlag = !this.hasChanges();
  }

  private hasChanges(): boolean {
    return JSON.stringify(this.favoriteMemories) === JSON.stringify(this.initialFavoriteMemories);
  }

  onSave(): void {
    this.dialogRef.close(this.favoriteMemories);
  }
}
