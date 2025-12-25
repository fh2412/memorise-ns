import { Component, Input, input } from '@angular/core';

@Component({
  selector: 'app-person-hint',
  imports: [],
  templateUrl: './person-hint.component.html',
  styleUrl: './person-hint.component.scss'
})
export class PersonHintComponent {
  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() username = '';
  readonly url = input('');
}
