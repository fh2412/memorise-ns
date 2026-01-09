import { Component } from '@angular/core';
import { MatChip, MatChipTrailingIcon } from "@angular/material/chips";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-unlimited-badge',
  imports: [MatChip, MatIcon, MatChipTrailingIcon],
  templateUrl: './unlimited-badge.component.html',
  styleUrl: './unlimited-badge.component.scss',
})
export class UnlimitedBadgeComponent {

}
