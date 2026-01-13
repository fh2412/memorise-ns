import { Component, output } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';

@Component({
    selector: 'app-view-selector',
    templateUrl: './view-selector.component.html',
    imports: [MatFormField, MatLabel, MatSelect, MatOption]
})
export class ViewSelectorComponent {
  selectedValue: 'standard' | 'map' = 'standard';

  options = [
    { value: 'standard', label: 'Standard' },
    { value: 'map', label: 'Map' },
    // { value: 'calendar', label: 'Calendar' }
  ];

  readonly selectionChanged = output<string>();

  onChange(value: 'standard' | 'map') {
    this.selectedValue = value;
    this.selectionChanged.emit(value);
  }
}