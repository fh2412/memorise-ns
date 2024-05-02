import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-selecor',
  templateUrl: './view-selecor.component.html',
  styleUrl: './view-selecor.component.scss'
})
export class ViewSelecorComponent {

  selectedView: string = 'standard'; // Set initial selected view
  viewOptions = ['standard', 'calendar', 'map']; // Options for the dropdown

  constructor(private router: Router) { }

  ngOnInit(): void { }

  onChangeView(view: string) {
    this.selectedView = view;
    this.router.navigate([view === 'standard' ? '/home' : `/home/${view}`]);
  }
}
