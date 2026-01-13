import { Component } from '@angular/core';
import { MatChip, MatChipTrailingIcon } from "@angular/material/chips";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-pro-badge',
  imports: [MatChip, MatIcon, MatChipTrailingIcon],
  templateUrl: './pro-badge.component.html',
  styleUrl: './pro-badge.component.scss',
})
export class ProBadgeComponent {

}
