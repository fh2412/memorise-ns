import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-memory-card',
  templateUrl: './memory-card.component.html',
  styleUrl: './memory-card.component.scss'
})
export class MemoryCardComponent {
  @Input() cardData: any; // Assuming cardData is an object with properties like title and description
  titleUrl: any;
  
  constructor(private router: Router) {}

  editMemory(event: Event) {
    this.router.navigate(['/editmemory', this.cardData.memory_id]);
    event.stopPropagation(); // Stop the event from propagating to the card click
  }
}
