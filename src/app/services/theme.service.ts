// theme.service.ts
import { Injectable, signal, computed } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly prefersColorScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  readonly currentTheme = signal<Theme>(
    (localStorage.getItem('theme') as Theme | null) || 'system'
  );

  readonly effectiveTheme = computed(() => {
    if (this.currentTheme() === 'system') {
      return this.prefersColorScheme?.matches ? 'dark' : 'light';
    }
    return this.currentTheme();
  });

  readonly isDarkMode = computed(() => this.effectiveTheme() === 'dark');
}