import { DOCUMENT } from '@angular/common';
import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  Renderer2,
  signal,
} from '@angular/core';

type Theme = 'light' | 'dark' | 'system';

@Component({
  selector: 'app-theme-switcher',
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.scss',
})
export class ThemeSwitcherComponent implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly prefersColorScheme = this.document.defaultView?.matchMedia(
    '(prefers-color-scheme: dark)'
  );
  private readonly mediaQueryListener = () => {
    if (this.currentTheme() === 'system') {
      this.updateTheme('system');
    }
  };
  private readonly renderer = inject(Renderer2);

  // Signals for reactive state management
  protected readonly currentTheme = signal<Theme>(
    (this.document.defaultView?.localStorage.getItem(
      'theme'
    ) as Theme | null) || 'system'
  );

  // Computed signals for derived state
  protected readonly effectiveTheme = computed(() => {
    if (this.currentTheme() === 'system') {
      return this.prefersColorScheme?.matches ? 'dark' : 'light';
    }
    return this.currentTheme();
  });

  protected readonly isDarkMode = computed(
    () => this.effectiveTheme() === 'dark'
  );

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
    // Clean up event listener
    this.prefersColorScheme.removeEventListener(
      'change',
      this.mediaQueryListener
    );
  }

  protected updateTheme(theme: Theme): void {
    if (!this.document.defaultView) {
      throw new Error('Document not found');
    }
    this.currentTheme.set(theme);

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
