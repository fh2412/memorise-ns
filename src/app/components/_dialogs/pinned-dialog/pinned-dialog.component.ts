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
    styleUrl: './pinned-dialog.component.scss',
    standalone: false
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
    if (!this.data) {
      console.error('Memory data is undefined or null');
      return;
    }
    console.log("pinned!", this.data.pinned, this.data.memories);
    this.favoriteMemories = this.transformMemories(this.data.pinned || [], true);
    this.initialFavoriteMemories = [...this.favoriteMemories];
    
    const pinnedIds = new Set(this.favoriteMemories.map(fav => fav.id));
    console.log(this.data.memories);

    this.allMemories = (this.data.memories || [])
      .filter(memory => !pinnedIds.has(memory.memory_id))
      .map(memory => ({
        name: memory.title,
        id: memory.memory_id,
        isFavorite: false
      }));
    
    this.filteredMemories = [...this.allMemories];
    this.selectedCount = this.favoriteMemories.length;
    console.log(this.favoriteMemories, this.allMemories)
  }
  
  private transformMemories(memoryData: Memory[], isFavorite: boolean): PinnedMemory[] {
    if (!memoryData || !Array.isArray(memoryData)) {
      return [];
    }
    
    return memoryData.map(memory => ({
      name: memory.title,
      id: memory.memory_id,
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
