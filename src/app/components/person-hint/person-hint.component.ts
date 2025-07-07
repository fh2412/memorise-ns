import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-person-hint',
  imports: [],
  templateUrl: './person-hint.component.html',
  styleUrl: './person-hint.component.scss'
})
export class PersonHintComponent {
  @Input() username = '';
}
