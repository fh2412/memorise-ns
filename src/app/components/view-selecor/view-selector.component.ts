import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-view-selector',
  templateUrl: './view-selector.component.html',
})
export class ViewSelectorComponent {
  selectedValue: 'standard' | 'map' = 'standard';

  options = [
    { value: 'standard', label: 'Standard' },
    { value: 'map', label: 'Map' },
    // { value: 'calendar', label: 'Calendar' }
  ];

  @Output() selectionChanged = new EventEmitter<string>();

  onChange(value: 'standard' | 'map') {
    this.selectedValue = value;
    this.selectionChanged.emit(value);
  }
}