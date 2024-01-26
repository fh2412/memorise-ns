import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-memory-card',
  templateUrl: './memory-card.component.html',
  styleUrl: './memory-card.component.scss'
})
export class MemoryCardComponent {
  @Input() cardData: any; // Assuming cardData is an object with properties like title and description
}
