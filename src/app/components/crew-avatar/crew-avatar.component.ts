import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-crew-avatar',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule],
  templateUrl: './crew-avatar.component.html',
  styleUrl: './crew-avatar.component.scss'
})
export class CrewAvatarComponent {
  // Signal Inputs
  name = input.required<string>();
  initials = input<string>(); // Optional override (e.g., "ME")
  profilePic = input<string | null | undefined>();
  isPlaceholder = input<boolean>(false);
  isNative = input<boolean>(false);
  removable = input<boolean>(false);

  // Output API
  remove = output<void>();
}