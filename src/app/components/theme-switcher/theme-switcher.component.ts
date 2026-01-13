import { DOCUMENT } from '@angular/common';
import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { ThemeService, Theme } from '@services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.scss',
})
export class ThemeSwitcherComponent implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly themeService = inject(ThemeService);
  private readonly prefersColorScheme = this.document.defaultView?.matchMedia(
    '(prefers-color-scheme: dark)'
  );
  private readonly mediaQueryListener = () => {
    if (this.currentTheme() === 'system') {
      this.updateTheme('system');
    }
  };
  private readonly renderer = inject(Renderer2);

  // Use service signals
  protected readonly currentTheme = this.themeService.currentTheme;
  protected readonly effectiveTheme = this.themeService.effectiveTheme;
  protected readonly isDarkMode = this.themeService.isDarkMode;

  ngOnInit(): void {
    if (!this.prefersColorScheme) {
      throw new Error('Prefers color scheme not supported');
    }
    // Initialize theme
    this.updateTheme(this.currentTheme());

    // Listen for system color scheme changes
    this.prefersColorScheme.addEventListener('change', this.mediaQueryListener);
  }

  ngOnDestroy(): void {
    if (!this.prefersColorScheme) {
      throw new Error('Prefers color scheme not supported');
    }
    this.prefersColorScheme.removeEventListener(
      'change',
      this.mediaQueryListener
    );
  }

  protected updateTheme(theme: Theme): void {
    if (!this.document.defaultView) {
      throw new Error('Document not found');
    }
    this.themeService.currentTheme.set(theme);

    this.renderer.setAttribute(
      this.document.documentElement,
      'data-theme',
      theme
    );

    // Update localStorage
    if (theme === 'system') {
      this.document.defaultView.localStorage.removeItem('theme');
    } else {
      this.document.defaultView.localStorage.setItem('theme', theme);
    }
  }
}