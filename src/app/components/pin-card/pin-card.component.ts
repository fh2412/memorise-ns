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
  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() memory!: Memory;
}
