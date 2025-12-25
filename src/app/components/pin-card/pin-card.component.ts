import { Component, Input } from '@angular/core';
import { Memory } from '@models/memoryInterface.model';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-pin-card',
    templateUrl: './pin-card.component.html',
    styleUrl: './pin-card.component.scss',
    imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule
],
})
export class PinCardComponent {
  @Input() memory!: Memory;
}
