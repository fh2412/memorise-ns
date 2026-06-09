import { Component, Input } from '@angular/core';
import { Memory } from '@models/memoryInterface.model';
import { MatIcon } from "@angular/material/icon";
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-planned-memory-card',
  imports: [MatIcon, DatePipe],
  templateUrl: './planned-memory-card.component.html',
  styleUrl: './planned-memory-card.component.scss',
})
export class PlannedMemoryCardComponent {
  @Input({ required: true }) plan!: Memory;
}
