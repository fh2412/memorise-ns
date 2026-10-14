import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButton, MatFabButton, MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { PlannedMemory } from '@models/memoryInterface.model';
import { BillingService } from '@services/billing.service';
import { MemoryService } from '@services/memory.service';
import { UserService } from '@services/userService';
import { catchError, debounce, distinctUntilChanged, map, of, switchMap, tap, timer } from 'rxjs';
import { MemoryCardComponent } from '../../components/memory-card/memory-card.component';
import { StorageLimitDialogComponent } from '../../components/_dialogs/storage-limit-dialog/storage-limit-dialog.component';
import { ViewMode, ViewSelectorComponent } from '../../components/view-selecor/view-selector.component';
import { HomeMapViewComponent } from './home-map-view/home-map-view.component';

/** 12 is divisible by 2, 3 and 4, so the last grid row is never ragged. */
const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 300;
/** TODO: replace with your real pricing / upgrade route. */
const UPGRADE_ROUTE = '/upgrade';

/** Derived from the service so we don't depend on where the interface lives. */
type PageQuery = Parameters<MemoryService['getMemoriesPage']>[1];
type LoadStatus = 'loading' | 'ready' | 'error';

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
    MatButton,
    MatFabButton,
    MatIconButton,
    MatIcon,
    MatPaginator,
  ],
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly userService = inject(UserService);
  private readonly memoryService = inject(MemoryService);
  private readonly billingService = inject(BillingService);

  // If this is ever empty the request fails and the error state offers a retry.
  protected readonly userId = String(this.userService.getLoggedInUserId() ?? '');

  protected readonly pageSize = PAGE_SIZE;
  protected readonly skeletons = Array.from({ length: PAGE_SIZE });

  // ── UI state ────────────────────────────────────────────────────────────
  protected readonly viewMode = signal<ViewMode>('standard');
  protected readonly sortAscending = signal(false);
  /** What the user has typed right now (updates on every keystroke). */
  protected readonly searchText = signal('');

  protected readonly isCompact = toSignal(
    inject(BreakpointObserver)
      .observe(Breakpoints.XSmall)
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  // ── Query state ─────────────────────────────────────────────────────────
  /** The trimmed search term that is actually sent to the API. */
  protected readonly searchTerm = toSignal(
    toObservable(this.searchText).pipe(
      map((text) => text.trim()),
      // Typing waits briefly; clearing the field applies immediately.
      debounce((text) => timer(text ? SEARCH_DEBOUNCE_MS : 0)),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );

  /** Jumps back to the first page whenever the search or sort order changes. */
  protected readonly pageIndex = linkedSignal({
    source: () => ({ search: this.searchTerm(), ascending: this.sortAscending() }),
    computation: () => 0,
  });

  private readonly reloadCount = signal(0);

  private readonly request = computed(() => {
    const query: PageQuery = {
      ascending: this.sortAscending(),
      page: this.pageIndex(),
      pageSize: PAGE_SIZE,
      filter: 'past',
      search: this.searchTerm() || undefined,
    };
    return { query, attempt: this.reloadCount() };
  });

  // ── Result state ────────────────────────────────────────────────────────
  protected readonly items = signal<PlannedMemory[]>([]);
  protected readonly total = signal(0);
  protected readonly status = signal<LoadStatus>('loading');

  // ── Derived state ───────────────────────────────────────────────────────
  protected readonly hasSearch = computed(() => this.searchTerm() !== '');
  protected readonly showSkeleton = computed(() => this.status() === 'loading' && this.items().length === 0);
  protected readonly isEmpty = computed(() => this.status() === 'ready' && this.items().length === 0);
  /** The user has no memories at all (as opposed to "search found nothing"). */
  protected readonly isFirstRun = computed(() => this.isEmpty() && !this.hasSearch());
  protected readonly sortLabel = computed(() => (this.sortAscending() ? 'Oldest first' : 'Newest first'));

  protected readonly subtitle = computed(() => {
    const count = this.total();
    if (count === 0) {
      return '';
    }
    if (this.hasSearch()) {
      return count === 1 ? '1 result' : `${count} results`;
    }
    return count === 1 ? '1 memory' : `${count} memories`;
  });

  constructor() {
    // switchMap cancels the in-flight request when a newer one starts, so
    // fast typing can never show out-of-order results.
    toObservable(this.request)
      .pipe(
        tap(() => this.status.set('loading')),
        switchMap(({ query }) =>
          this.memoryService.getMemoriesPage(this.userId, query).pipe(
            map((response) => ({ response })),
            catchError((error) => {
              console.error('Error loading memories:', error);
              return of({ response: null });
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(({ response }) => {
        if (!response) {
          this.items.set([]);
          this.total.set(0);
          this.status.set('error');
          return;
        }
        this.items.set(response.data ?? []);
        this.total.set(response.total ?? 0);
        this.status.set('ready');
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

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected reload(): void {
    this.reloadCount.update((count) => count + 1);
  }

  protected addMemory(): void {
    if (!this.billingService.canCreateNewMemory()) {
      this.dialog
        .open(StorageLimitDialogComponent, {
          data: { usedGb: this.billingService.storageUsedGB() },
        })
        .afterClosed()
        .subscribe((choice) => {
          if (choice === 'upgrade') {
            this.router.navigate([UPGRADE_ROUTE]);
          }
        });
      return;
    }
    this.router.navigate(['/newmemory'], { state: { activityId: 1 } });
  }
}