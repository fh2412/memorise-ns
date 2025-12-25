import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, startWith, map, firstValueFrom } from 'rxjs';
import { MemoryService } from '@services/memory.service';
import { MemorySearchData } from '@models/memoryInterface.model';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-memory-selecter',
  templateUrl: './memory-selecter.component.html',
  styleUrl: './memory-selecter.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class MemorySelectorComponent implements OnInit {
  private memoryService = inject(MemoryService);

  @Input() userId!: string;
  @Input() memoryId: string | null = null;
  @Output() memorySelected = new EventEmitter<number>();

  memories: MemorySearchData[] = [];
  filteredMemories!: Observable<MemorySearchData[]>;
  searchControl = new FormControl('');
  selectedMemory: MemorySearchData | null = null;
  loading = true;

  async ngOnInit(): Promise<void> {
    try {
      await this.loadMemoriesSearchData();

      if (this.memoryId) {
        this.selectInitMemory(this.memoryId);
      }

      // Set up filtering based on search input
      this.filteredMemories = this.searchControl.valueChanges.pipe(
        startWith(''),
        map(value => this._filterMemories(value || ''))
      );
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  }

  private async loadMemoriesSearchData(): Promise<void> {
    this.loading = true;
    try {
      this.memories = await firstValueFrom(
        this.memoryService.getMemoriesSearchData(this.userId, true)
      );
    } catch (error) {
      console.error('Error loading memories:', error);
      this.memories = [];
    } finally {
      this.loading = false;
    }
  }

  private _filterMemories(value: string): MemorySearchData[] {
    const filterValue = value.toLowerCase();

    // Return up to 5 memories matching the filter
    return this.memories
      .filter(memory =>
        memory.title.toLowerCase().includes(filterValue) ||
        memory.text.toLowerCase().includes(filterValue)
      )
      .slice(0, 5); // Limit to 5 items
  }

  selectMemory(memory: MemorySearchData) {
    this.selectedMemory = memory;
    this.memorySelected.emit(memory.memory_id);
  }

  //Select an Memory when loading if in Edit Activity Component
  selectInitMemory(memoryId: string) {
    const memory = this.memories.find(m => m.memory_id === Number(memoryId));
    if (memory) {
      this.selectMemory(memory);
    }
  }

}
