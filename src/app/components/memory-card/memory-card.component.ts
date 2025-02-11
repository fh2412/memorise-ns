import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Memory } from '../../models/memoryInterface.model';

@Component({
    selector: 'app-memory-card',
    templateUrl: './memory-card.component.html',
    styleUrl: './memory-card.component.scss',
    standalone: false
})
export class MemoryCardComponent {
  @Input() cardData!: Memory;
  titleUrl: string | undefined;
  
  constructor(private router: Router, private datePipe: DatePipe) {}

  editMemory(event: Event) {
    this.router.navigate(['/editmemory', this.cardData.memory_id]);
    event.stopPropagation(); // Stop the event from propagating to the card click
  }

  formatDate(date: string | undefined, end_date: string | undefined): string {
    if (!date || !end_date) {
      return 'N/A';
    }
    
    const from = this.datePipe.transform(new Date(date), 'dd.MM.yyyy') || 'N/A';
    const to = this.datePipe.transform(new Date(end_date), 'dd.MM.yyyy') || 'N/A';

    return from === to ? from : `${from} - ${to}`;
  }
}
