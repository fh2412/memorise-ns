import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, startWith, map } from 'rxjs';
import { MemoryService } from '../../services/memory.service';
import { Memory } from '../../models/memoryInterface.model';
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
  @Input() userId!: string;
  @Output() memorySelected = new EventEmitter<number>();

  memories: Memory[] = [];
  filteredMemories!: Observable<Memory[]>;
  searchControl = new FormControl('');
  selectedMemory: Memory | null = null;
  loading = true;
  
  constructor(private memoryService: MemoryService) {}
  
  ngOnInit() {
    // Load memories using the provided service function
    this.loading = true;
    this.memoryService.getCreatedMemory(this.userId)
      .subscribe({
        next: (memories) => {
          this.memories = memories;
          this.loading = false;
          
          // Set up filtering based on search input
          this.filteredMemories = this.searchControl.valueChanges.pipe(
            startWith(''),
            map(value => this._filterMemories(value || ''))
          );
        },
        error: (err) => {
          console.error('Error loading memories:', err);
          this.loading = false;
        }
      });
  }
  
  private _filterMemories(value: string): Memory[] {
    const filterValue = value.toLowerCase();
    
    // Return up to 5 memories matching the filter
    return this.memories
      .filter(memory => 
        memory.title.toLowerCase().includes(filterValue) || 
        memory.text.toLowerCase().includes(filterValue)
      )
      .slice(0, 5); // Limit to 5 items
  }
  
  selectMemory(memory: Memory) {
    this.selectedMemory = memory;
    this.memorySelected.emit(memory.memory_id);  }
}
