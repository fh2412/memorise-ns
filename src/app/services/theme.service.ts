import { Injectable, signal, computed } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly mql = window.matchMedia('(prefers-color-scheme: dark)');
  private readonly systemDark = signal(this.mql.matches);

  readonly currentTheme = signal<Theme>(
    (localStorage.getItem('theme') as Theme | null) || 'system'
  );

  readonly effectiveTheme = computed(() =>
    this.currentTheme() === 'system'
      ? (this.systemDark() ? 'dark' : 'light')
      : this.currentTheme()
  );

  readonly isDarkMode = computed(() => this.effectiveTheme() === 'dark');

  constructor() {
    this.mql.addEventListener('change', (e) => this.systemDark.set(e.matches));
  }
}