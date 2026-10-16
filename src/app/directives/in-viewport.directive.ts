import { Directive, ElementRef, effect, inject, input, output } from '@angular/core';

/**
 * Emits when the host element comes within `rootMargin` of the scroll root.
 * Toggling `disabled` re-creates the observer, so if the element is still
 * visible after a page has loaded, it fires again immediately (large screens).
 */
@Directive({ selector: '[appInViewport]' })
export class InViewportDirective {
  readonly viewportRoot = input<Element | null>(null);
  readonly rootMargin = input('0px 0px 600px 0px');
  readonly disabled = input(false);
  readonly inViewport = output<void>();

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    effect((onCleanup) => {
      if (this.disabled()) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) this.inViewport.emit();
        },
        { root: this.viewportRoot(), rootMargin: this.rootMargin() },
      );
      observer.observe(element);
      onCleanup(() => observer.disconnect());
    });
  }
}