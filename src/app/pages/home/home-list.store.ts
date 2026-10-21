import { Injectable, inject } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';
import { PlannedMemory } from '@models/memoryInterface.model';
import { ViewMode } from '../../components/view-selecor/view-selector.component';

const MAX_AGE_MS = 10 * 60 * 1000;

export interface HomeListSnapshot {
  userId: string;
  version: number;
  viewMode: ViewMode;
  sortAscending: boolean;
  searchText: string;
  items: PlannedMemory[];
  total: number;
  nextPage: number;
  endReached: boolean;
  scrollTop: number;
}

/** Keeps the home list alive while HomeComponent is destroyed. */
@Injectable({ providedIn: 'root' })
export class HomeListStore {
  private snapshot: (HomeListSnapshot & { savedAt: number }) | null = null;
  private lastTrigger: NavigationStart['navigationTrigger'] = 'imperative';

  constructor() {
    inject(Router)
      .events.pipe(filter((e): e is NavigationStart => e instanceof NavigationStart))
      .subscribe((e) => (this.lastTrigger = e.navigationTrigger));
  }

  save(snapshot: HomeListSnapshot): void {
    this.snapshot = { ...snapshot, savedAt: Date.now() };
  }

  /** Returns the snapshot only for browser back/forward, and only if still valid. Consumes it. */
  take(userId: string, version: number): HomeListSnapshot | null {
    const s = this.snapshot;
    this.snapshot = null;
    const valid =
      !!s &&
      this.lastTrigger === 'popstate' &&
      s.userId === userId &&
      s.version === version &&
      Date.now() - s.savedAt < MAX_AGE_MS;
    return valid ? s : null;
  }

  clear(): void {
    this.snapshot = null;
  }
}