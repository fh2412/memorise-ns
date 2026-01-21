import { Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  imports: [MatProgressSpinnerModule],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss',
})
export class LoadingSpinnerComponent {
  diameter = input<number>(50);
  strokeWidth = input<number>(4);
  color = input<'primary' | 'accent' | 'warn'>('primary');
  message = input<string>('');
}
