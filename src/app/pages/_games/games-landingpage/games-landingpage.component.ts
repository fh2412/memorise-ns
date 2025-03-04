import { Component } from '@angular/core';

interface Game {
  id: string;
  title: string;
  description: string;
  iconName: string;
  color: string;
  enabled: boolean;
}

@Component({
  selector: 'app-games-landingpage',
  standalone: false,
  templateUrl: './games-landingpage.component.html',
  styleUrl: './games-landingpage.component.scss'
})
export class GamesLandingpageComponent {
  games: Game[] = [
    {
      id: 'minesweeper',
      title: 'Minesweeper',
      description: 'The classic puzzle game of strategy and chance. Clear the field without detonating any mines!',
      iconName: 'grid_on',
      color: 'primary',
      enabled: true
    },
    {
      id: 'pacman',
      title: 'Pacman',
      description: 'Navigate mazes, collect dots, and avoid ghosts in this arcade classic.',
      iconName: 'sports_esports',
      color: 'accent',
      enabled: false
    },
    {
      id: 'flappy-bird',
      title: 'Flappy Bird',
      description: 'Tap to navigate through pipes in this addictive side-scroller game.',
      iconName: 'flight',
      color: 'warn',
      enabled: false
    },
    {
      id: 'aim-trainer',
      title: 'Aim Trainer',
      description: 'Test and improve your reaction time and accuracy with this precision trainer.',
      iconName: 'track_changes',
      color: 'accent',
      enabled: false
    }
  ];

  playGame(gameId: string): void {
    if(gameId === 'minesweeper') {
      window.open('https://game.memorise.online', '_blank');
    }
  }
}