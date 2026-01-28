import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Memory } from '@models/memoryInterface.model';
import { MatIcon } from "@angular/material/icon";
import { DatePipe } from '@angular/common';


@Component({
    selector: 'app-pin-card',
    templateUrl: './pin-card.component.html',
    styleUrl: './pin-card.component.scss',
    imports: [
    MatCardModule,
    MatChipsModule,
    MatIcon,
    DatePipe,
],
})
export class PinCardComponent {
  readonly memory = input.required<Memory>()
}
