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
    if (!date) {
      return 'N/A';
    }
    const parsedDate = new Date(date);
    console.log(date, end_date);
    if(date == end_date) {
      return this.datePipe.transform(parsedDate, 'dd.MM.yyyy') || 'N/A';
    }
    else if(end_date){
      const parsedEndDate = new Date(end_date);
      var from = this.datePipe.transform(parsedDate, 'dd.MM.yyyy') || 'N/A';
      var to = this.datePipe.transform(parsedEndDate, 'dd.MM.yyyy') || 'N/A';
      return from + " - " + to
    }
    else{
      return 'N/A';
    }
  }
}
