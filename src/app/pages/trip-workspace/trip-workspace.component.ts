import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggle } from "@angular/material/slide-toggle";

interface CrewMember {
  name: string;
  status: 'online' | 'away' | 'offline';
  color: string; // Hex code or M3 CSS class token
  initials: string;
}

@Component({
  selector: 'app-trip-workspace',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MatBadgeModule,
    MatTooltipModule,
    MatSlideToggle
],
  templateUrl: './trip-workspace.component.html',
  styleUrls: ['./trip-workspace.component.scss']
})
export class TripWorkspaceComponent {
  // Signal to track the current board view mode
  currentView = signal<'corkboard' | 'structured'>('corkboard');

  // Dummy data for the crew members
  crew = signal<CrewMember[]>([
    { name: 'Florian (You)', status: 'online', color: '#6750A4', initials: 'FH' }, // M3 Primary
    { name: 'Miriam', status: 'online', color: '#B3261E', initials: 'MI' },       // M3 Error/Red accent
    { name: 'Jonas', status: 'away', color: '#625B71', initials: 'JO' },         // M3 Secondary
    { name: 'Niki', status: 'offline', color: '#7D5260', initials: 'NI' }         // M3 Tertiary
  ]);

  // Available "free" colors a new user could pick from
  availableColors = ['#4F378B', '#006874', '#386A20', '#A63E2B', '#005FAF'];

  // Change view toggle handler
  onViewChange(view: 'corkboard' | 'structured') {
    this.currentView.set(view);
  }

  // "Stupid" buttons dummy actions
  addCrewMember() {
    alert('Mock Action: Open add friend dialogue / Create Placeholder Crew Member.');
  }

  changeMyColor() {
    alert('Mock Action: Cycle through unassigned M3 palette colors.');
  }

  manageDates() {
    alert('Mock Action: Open interactive calendar sheet or change trip length.');
  }

  toggleViewMode(): void {
    this.currentView.update(view => view === 'corkboard' ? 'structured' : 'corkboard');
  }
}