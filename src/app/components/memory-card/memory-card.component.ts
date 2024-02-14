import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-memory-card',
  templateUrl: './memory-card.component.html',
  styleUrl: './memory-card.component.scss'
})
export class MemoryCardComponent {
  @Input() cardData: any;
  titleUrl: any;
  
  constructor(private router: Router, private datePipe: DatePipe) {}

  editMemory(event: Event) {
    this.router.navigate(['/editmemory', this.cardData.memory_id]);
    event.stopPropagation(); // Stop the event from propagating to the card click
  }

  formatDate(date: string | undefined, end_date: string | undefined): string {
    if (!date || !end_date) {
      return 'N/A';
    }
    const parsedDate = new Date(date);
    const parsedEndDate = new Date(end_date);
    var from = this.datePipe.transform(parsedDate, 'dd.MM.yyyy') || 'N/A';
    var to = this.datePipe.transform(parsedEndDate, 'dd.MM.yyyy') || 'N/A';

    if(from == to) {
      return from
    }
    else {
      return from + " - " + to
    }
  }
}
