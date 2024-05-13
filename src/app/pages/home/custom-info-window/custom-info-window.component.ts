import { Component, Input } from '@angular/core';

interface Memory {
  title: string;
  title_pic: string;
  memory_id: number;
}

@Component({
  selector: 'app-custom-info-window',
  templateUrl: './custom-info-window.component.html',
  styleUrls: ['./custom-info-window.component.scss']
})
export class CustomInfoWindowComponent {
  @Input() memory: any;

  onButtonClick(memory: Memory) {
    // Handle button click here (consider emitting an event if needed)
    console.log('Details button clicked for memory:', memory);
  }
}
