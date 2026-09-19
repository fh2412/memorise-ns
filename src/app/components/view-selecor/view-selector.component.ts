import { Component, model, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggle } from '@angular/material/slide-toggle';

export type ViewMode = 'standard' | 'map';

@Component({
  selector: 'app-view-selector',
  templateUrl: './view-selector.component.html',
  styleUrl: './view-selector.component.scss',
  imports: [MatIcon, MatSlideToggle]
})
export class ViewSelectorComponent {
  // Signal-based state for state tracking
  selectedValue = model<ViewMode>('standard');

  // Kept for backward compatibility with your original output
  readonly selectionChanged = output<ViewMode>();

  toggleView(isMap: boolean) {
    const nextView: ViewMode = isMap ? 'map' : 'standard';
    this.selectedValue.set(nextView);
    this.selectionChanged.emit(nextView);
  }
}