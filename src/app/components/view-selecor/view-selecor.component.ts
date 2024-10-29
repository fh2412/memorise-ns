import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-view-selecor',
  templateUrl: './view-selecor.component.html',
})
export class ViewSelecorComponent {
  selectedValue: string = 'standard'; // Set default value

  options = [
    { value: 'standard', label: 'Standard' },
    { value: 'map', label: 'Map' },
    { value: 'calendar', label: 'Calendar' }
  ];

  @Output() selectionChanged = new EventEmitter<string>();

  onChange(value: string) {
    this.selectedValue = value;
    this.selectionChanged.emit(value);
  }
}
