import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pin-card',
  templateUrl: './pin-card.component.html',
  styleUrl: './pin-card.component.scss'
})
export class PinCardComponent {
  @Input() memory: any;
}
