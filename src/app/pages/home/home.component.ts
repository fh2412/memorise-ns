import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { DatePipe } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButton, MatFabButton, MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { NavigationStart, Router } from '@angular/router';
import { PaginatedMemoryResponse, PlannedMemory } from '@models/memoryInterface.model';
import { BillingService } from '@services/billing.service';
import { MemoryService } from '@services/memory.service';
import { UserService } from '@services/userService';
import {
  catchError, debounce, distinctUntilChanged, exhaustMap, filter, map, Observable, of,
  startWith, Subject, switchMap, timer,
} from 'rxjs';
import { MemoryCardComponent } from '../../components/memory-card/memory-card.component';
import { StorageLimitDialogComponent } from '../../components/_dialogs/storage-limit-dialog/storage-limit-dialog.component';
import { ViewMode, ViewSelectorComponent } from '../../components/view-selecor/view-selector.component';
import { InViewportDirective } from '../../directives/in-viewport.directive';
import { HomeListStore } from './home-list.store';
import { HomeMapViewComponent } from './home-map-view/home-map-view.component';

/** 12 is divisible by 2, 3 and 4, so every full page fills complete rows. */
const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 300;
/** TODO: replace with your real pricing / upgrade route. */
const UPGRADE_ROUTE = '/upgrade';

type PageQuery = Parameters<MemoryService['getMemoriesPage']>[1];
type LoadStatus = 'loading' | 'loadingMore' | 'ready' | 'error' | 'errorMore';
interface ListQuery { ascending: boolean; search?: string; attempt: number }
interface PageResult { page: number; response: PaginatedMemoryResponse | null }

function appendUnique(current: PlannedMemory[], incoming: PlannedMemory[]): PlannedMemory[] {
  const seen = new Set(current.map((m) => m.memory_id));
  return [...current, ...incoming.filter((m) => !seen.has(m.memory_id))];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
  imports: [
    HomeMapViewComponent,
    MemoryCardComponent,
    ViewSelectorComponent,
    InViewportDirective,
    MatButton,
    MatFabButton,
    MatIconButton,
    MatIcon,
  ],
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly userService = inject(UserService);
  private readonly memoryService = inject(MemoryService);
  private readonly billingService = inject(BillingService);
  private readonly store = inject(HomeListStore);
  /** mat-sidenav-content provides CdkScrollable – it is the real scroll container. */
  private readonly scroller = inject(CdkScrollable, { optional: true });

  protected readonly userId = String(this.userService.getLoggedInUserId() ?? '');

  /** Non-null only when returning via browser back/forward with a valid snapshot. */
  private readonly snapshot = this.store.take(this.userId, this.memoryService.listVersion());

  protected readonly scrollRoot = this.scroller?.getElementRef().nativeElement ?? null;
  protected readonly skeletons = Array.from({ length: PAGE_SIZE });

  // ── UI state ────────────────────────────────────────────────────────────
  protected readonly viewMode = signal<ViewMode>(this.snapshot?.viewMode ?? 'standard');
  protected readonly sortAscending = signal(this.snapshot?.sortAscending ?? false);
  protected readonly searchText = signal(this.snapshot?.searchText ?? '');

  protected readonly isCompact = toSignal(
    inject(BreakpointObserver).observe(Breakpoints.XSmall).pipe(map((s) => s.matches)),
    { initialValue: false },
  );

  // ── Query state ─────────────────────────────────────────────────────────
  protected readonly searchTerm = toSignal(
    toObservable(this.searchText).pipe(
      map((text) => text.trim()),
      debounce((text) => timer(text ? SEARCH_DEBOUNCE_MS : 0)),
      distinctUntilChanged(),
    ),
    { initialValue: this.snapshot?.searchText ?? '' },
  );

  private readonly reloadCount = signal(0);
  private readonly loadMore$ = new Subject<void>();

  private readonly query = computed<ListQuery>(() => ({
    ascending: this.sortAscending(),
    search: this.searchTerm() || undefined,
    attempt: this.reloadCount(),
  }));

  // ── Result state ────────────────────────────────────────────────────────
  protected readonly items = signal<PlannedMemory[]>(this.snapshot?.items ?? []);
  protected readonly total = signal(this.snapshot?.total ?? 0);
  private readonly nextPage = signal(this.snapshot?.nextPage ?? 0);
  private readonly endReached = signal(this.snapshot?.endReached ?? false);
  protected readonly status = signal<LoadStatus>(this.snapshot ? 'ready' : 'loading');

  // ── Derived state ───────────────────────────────────────────────────────
  protected readonly hasSearch = computed(() => this.searchTerm() !== '');
  protected readonly hasMore = computed(() => !this.endReached() && this.items().length < this.total());
  protected readonly showSkeleton = computed(() => this.status() === 'loading' && this.items().length === 0);
  protected readonly isEmpty = computed(() => this.status() === 'ready' && this.items().length === 0);
  protected readonly isFirstRun = computed(() => this.isEmpty() && !this.hasSearch());
  protected readonly sortLabel = computed(() => (this.sortAscending() ? 'Oldest first' : 'Newest first'));
  /** Skeletons appended while the next page loads – never more than what's left. */
  protected readonly pendingSkeletons = computed(() =>
    Array.from({ length: Math.max(0, Math.min(PAGE_SIZE, this.total() - this.items().length)) }),
  );
  protected readonly isBusy = computed(() => this.status() === 'loading' || this.status() === 'loadingMore');
  protected readonly liveMessage = computed(() => {
    switch (this.status()) {
      case 'loadingMore': return 'Loading more memories…';
      case 'errorMore': return 'More memories could not be loaded.';
      case 'ready': return this.hasMore() ? '' : this.items().length ? 'All memories loaded.' : '';
      default: return '';
    }
  });

  protected readonly subtitle = computed(() => {
    const count = this.total();
    if (count === 0) return '';
    if (this.hasSearch()) return count === 1 ? '1 result' : `${count} results`;
    return count === 1 ? '1 memory' : `${count} memories`;
  });

  constructor() {
    this.connectLoader();
    this.saveSnapshotOnLeave();

    if (this.snapshot) {
      const top = this.snapshot.scrollTop;
      afterNextRender(() => this.scroller?.scrollTo({ top }));
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────────
  private connectLoader(): void {
    let restoring = this.snapshot !== null;
    let isFirstQuery = true;

    toObservable(this.query)
      .pipe(
        // A new search/sort/retry cancels everything in flight for the old query.
        switchMap((query) => {
          const skipFirstPage = restoring;
          restoring = false;

          if (!skipFirstPage) {
            this.nextPage.set(0);
            this.endReached.set(false);
            if (!isFirstQuery) this.scroller?.scrollTo({ top: 0 });
          }
          isFirstQuery = false;

          const triggers$ = skipFirstPage ? this.loadMore$ : this.loadMore$.pipe(startWith(undefined));
          // exhaustMap: ignore load-more triggers while a page is in flight.
          return triggers$.pipe(exhaustMap(() => this.fetchNextPage(query)));
        }),
        takeUntilDestroyed(),
      )
      .subscribe(({ page, response }) => this.applyPage(page, response));
  }

  private fetchNextPage(query: ListQuery): Observable<PageResult> {
    const page = this.nextPage();
    this.status.set(page === 0 ? 'loading' : 'loadingMore');

    const request: PageQuery = {
      ascending: query.ascending,
      search: query.search,
      page,
      pageSize: PAGE_SIZE,
      filter: 'past',
    };

    return this.memoryService.getMemoriesPage(this.userId, request).pipe(
      map((response): PageResult => ({ page, response })),
      catchError((error) => {
        console.error('Error loading memories:', error);
        return of<PageResult>({ page, response: null });
      }),
    );
  }

  private applyPage(page: number, response: PaginatedMemoryResponse | null): void {
    if (!response) {
      if (page === 0) {
        this.items.set([]);
        this.total.set(0);
        this.status.set('error');
      } else {
        this.status.set('errorMore');
      }
      return;
    }

    const incoming = response.data ?? [];
    this.items.update((current) => (page === 0 ? incoming : appendUnique(current, incoming)));
    this.total.set(response.total ?? 0);
    this.nextPage.set(page + 1);
    this.endReached.set(incoming.length < PAGE_SIZE);
    this.status.set('ready');
  }

  // ── Scroll restoration ──────────────────────────────────────────────────
  /** Saved on NavigationStart because the DOM (and scrollTop) is still intact then. */
  private saveSnapshotOnLeave(): void {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationStart), takeUntilDestroyed())
      .subscribe(() => {
        const status = this.status();
        if (this.items().length === 0 || status === 'loading' || status === 'error') {
          this.store.clear();
          return;
        }
        this.store.save({
          userId: this.userId,
          version: this.memoryService.listVersion(),
          viewMode: this.viewMode(),
          sortAscending: this.sortAscending(),
          searchText: this.searchTerm() || '',
          items: this.items(),
          total: this.total(),
          nextPage: this.nextPage(),
          endReached: this.endReached(),
          scrollTop: this.scroller?.measureScrollOffset('top') ?? 0,
        });
      });
  }

  // ── Handlers ────────────────────────────────────────────────────────────
  protected changeView(newView: ViewMode): void {
    this.viewMode.set(newView);
  }

  protected onSearchInput(event: Event): void {
    this.searchText.set((event.target as HTMLInputElement).value);
  }

  protected clearSearch(): void {
    this.searchText.set('');
  }

  protected setSort(ascending: boolean): void {
    this.sortAscending.set(ascending);
  }

  protected loadMore(): void {
    if (this.status() === 'ready' && this.hasMore()) this.loadMore$.next();
  }

  protected retryMore(): void {
    if (this.status() === 'errorMore') this.loadMore$.next();
  }

  protected reload(): void {
    this.reloadCount.update((count) => count + 1);
  }

  protected addMemory(): void {
    // unchanged
  }
}