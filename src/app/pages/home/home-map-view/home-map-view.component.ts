import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, Injector, PLATFORM_ID,
  afterNextRender, computed, effect, inject, input, signal, untracked, viewChild,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { GoogleMap, MapAdvancedMarker, MapMarkerClusterer } from '@angular/google-maps';
import { Renderer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer';
import { Cluster } from '@angular/google-maps';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom, map } from 'rxjs';

import { MemoryService } from '@services/memory.service';
import { environment } from '../../../../environments/environment';
import { loadGoogleMapsLibraries } from '../../../utils/google-maps-loader';
import {
  LatLng, MapMemoryView, boundsOf, filterBySearch, idsSignature, isSameSpot, sortForList, stackOrder, toView,
} from './home-map-view.helpers';
import { createPinElement, createStackElement, memberIdsOf, memoryIdOf } from './map-marker-elements';

const MAX_ZOOM = 18;
const SINGLE_MEMORY_ZOOM = 12;
const SELECT_MIN_ZOOM = 13;
const DEFAULT_CENTER = { lat: 48.2082, lng: 16.3738 }; // Vienna

/** Space below the map: phones keep room for the FAB, desktop just a small gap. */
const BOTTOM_GAP_PHONE = 88;
const BOTTOM_GAP_DESKTOP = 24;
const MIN_HEIGHT = 360;

const Z_CLUSTER = 1_000;
const Z_PINNED = 100_000;
const Z_ACTIVE = 200_000;

@Component({
  selector: 'app-home-map-view',
  templateUrl: './home-map-view.component.html',
  styleUrl: './home-map-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    GoogleMap,
    MapAdvancedMarker,
    MapMarkerClusterer,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  host: {
    '[style.height.px]': 'viewHeight()',
    '(keydown.escape)': 'clearSelection()',
  },
})
export class HomeMapViewComponent {
  private readonly memoryService = inject(MemoryService);
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Home search term – the map shows the same memories as the grid. */
  readonly search = input('');

  protected readonly isWide = toSignal(
    inject(BreakpointObserver).observe('(min-width: 960px)').pipe(map(r => r.matches)),
    { initialValue: false },
  );

  // ── Map setup ────────────────────────────────────────────────────────────

  protected readonly mapsReady = signal(false);
  protected readonly mapsFailed = signal(false);
  private readonly mapInstance = signal<google.maps.Map | null>(null);

  /** mapId is required for advanced markers. Styling lives in the Cloud Console (see README). */
  protected readonly mapOptions: google.maps.MapOptions = {
    mapId: environment.googleMapId,
    center: DEFAULT_CENTER,
    zoom: 4,
    minZoom: 2,
    maxZoom: MAX_ZOOM,
    gestureHandling: 'greedy',     // full-screen map → one-finger pan on phones
    clickableIcons: false,
    disableDefaultUI: true,
    zoomControl: true,
    keyboardShortcuts: true,
  };

  protected readonly algorithm = new SuperClusterAlgorithm({ radius: 72, maxZoom: MAX_ZOOM });
  protected readonly renderer: Renderer = { render: cluster => this.renderCluster(cluster) };

  // ── Data ─────────────────────────────────────────────────────────────────

  protected readonly state = signal<'loading' | 'ready' | 'error'>('loading');
  private readonly all = signal<MapMemoryView[]>([]);
  private readonly byId = computed(() => new Map(this.all().map(m => [m.memoryId, m])));

  protected readonly memories = computed(() => sortForList(filterBySearch(this.all(), this.search())));
  protected readonly pinned = computed(() => this.memories().filter(m => m.isPinned));
  protected readonly regular = computed(() => this.memories().filter(m => !m.isPinned));
  private readonly visibleSignature = computed(() => idsSignature(this.memories()));

  // ── Selection / panel ────────────────────────────────────────────────────

  protected readonly selectedId = signal<number | null>(null);
  protected readonly hoveredId = signal<number | null>(null);
  protected readonly spotIds = signal<ReadonlySet<number> | null>(null);
  protected readonly sheetExpanded = signal(false);

  protected readonly selected = computed(() => {
    const id = this.selectedId();
    return id === null ? null : this.byId().get(id) ?? null;
  });

  protected readonly listItems = computed(() => {
    const spot = this.spotIds();
    return spot ? this.memories().filter(m => spot.has(m.memoryId)) : this.memories();
  });

  protected readonly listTitle = computed(() => {
    const n = this.listItems().length;
    if (this.spotIds()) return `${n} memories at this spot`;
    return `${n} ${n === 1 ? 'memory' : 'memories'} on the map`;
  });

  private readonly activeIds = computed(() =>
    new Set([this.hoveredId(), this.selectedId()].filter((id): id is number => id !== null)),
  );

  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  // ── Layout ───────────────────────────────────────────────────────────────

  protected readonly viewHeight = signal(600);

  // ── Marker DOM caches ────────────────────────────────────────────────────

  private readonly pinEls = new Map<string, HTMLElement>();
  private readonly clusterEls = new Set<HTMLElement>();
  private generation = 0;

  constructor() {
    if (!this.isBrowser) return;

    loadGoogleMapsLibraries()
      .then(() => this.mapsReady.set(true))
      .catch(error => {
        console.error('Loading Google Maps failed:', error);
        this.mapsFailed.set(true);
      });

    // (Re)load after create/edit/delete elsewhere in the app
    effect(() => {
      this.memoryService.listVersion();
      untracked(() => void this.load());
    });

    // Fit all markers when the map is ready or the visible set changes (search)
    effect(() => {
      const mapRef = this.mapInstance();
      this.visibleSignature();
      if (mapRef) untracked(() => this.fitAll());
    });

    // Drop a selection that is no longer visible (search changed)
    effect(() => {
      const visible = new Set(this.memories().map(m => m.memoryId));
      untracked(() => {
        if (this.selectedId() !== null && !visible.has(this.selectedId()!)) this.selectedId.set(null);
      });
    });

    effect(() => {
      const active = this.activeIds();
      untracked(() => this.applyHighlight(active));
    });

    effect(() => {
      this.isWide();
      untracked(() => this.updateHeight());
    });

    const onResize = () => this.updateHeight();
    window.addEventListener('resize', onResize, { passive: true });
    inject(DestroyRef).onDestroy(() => window.removeEventListener('resize', onResize));
    afterNextRender(() => this.updateHeight());
  }

  // ── Loading ──────────────────────────────────────────────────────────────

  private async load(): Promise<void> {
    const gen = ++this.generation;
    if (this.all().length === 0) this.state.set('loading');
    try {
      const memories = await firstValueFrom(this.memoryService.getMapMemories());
      if (gen !== this.generation) return;
      this.all.set(memories.map(toView));
      this.state.set('ready');
    } catch (error) {
      console.error('Loading map memories failed:', error);
      if (gen === this.generation && this.all().length === 0) this.state.set('error');
    }
  }

  protected retry(): void {
    void this.load();
  }

  protected onMapReady(mapRef: google.maps.Map): void {
    this.mapInstance.set(mapRef);
  }

  // ── Markers ──────────────────────────────────────────────────────────────

  /** Cached per memory → stable reference for <map-advanced-marker [content]>. */
  protected pinContent(memory: MapMemoryView): HTMLElement {
    const key = `${memory.memoryId}|${memory.thumb ?? ''}|${memory.isPinned}`;
    let el = this.pinEls.get(key);
    if (!el) {
      el = createPinElement(this.document, memory);
      el.classList.toggle('mm-pin--active', this.activeIds().has(memory.memoryId));
      this.pinEls.set(key, el);
    }
    return el;
  }

  protected zIndexFor(memory: MapMemoryView): number {
    if (this.activeIds().has(memory.memoryId)) return Z_ACTIVE;
    return memory.isPinned ? Z_PINNED : 0;
  }

  protected onClusteringBegin(): void {
    this.clusterEls.clear();
  }

  private renderCluster({ count, position, markers }: Cluster): google.maps.marker.AdvancedMarkerElement {
    const ids = (markers ?? []).map(memoryIdOf).filter((id): id is number => id !== null);
    const members = ids.map(id => this.byId().get(id)).filter((m): m is MapMemoryView => !!m);

    const content = createStackElement(this.document, stackOrder(members), count, ids);
    const active = untracked(this.activeIds);
    content.classList.toggle('mm-stack--active', ids.some(id => active.has(id)));
    this.clusterEls.add(content);

    return new google.maps.marker.AdvancedMarkerElement({
      position,
      content,
      zIndex: Z_CLUSTER + count,
      title: `${count} memories – click to ${isSameSpot(members.map(m => m.position)) ? 'list them' : 'zoom in'}`,
    });
  }

  private applyHighlight(active: ReadonlySet<number>): void {
    for (const el of this.pinEls.values()) {
      el.classList.toggle('mm-pin--active', active.has(Number(el.dataset['memoryId'])));
    }
    for (const el of this.clusterEls) {
      el.classList.toggle('mm-stack--active', memberIdsOf(el).some(id => active.has(id)));
    }
  }

  // ── Interaction ──────────────────────────────────────────────────────────

  protected selectFromMap(memory: MapMemoryView): void {
    if (this.spotIds() && !this.spotIds()!.has(memory.memoryId)) this.spotIds.set(null);
    this.selectedId.set(memory.memoryId);
    if (!this.isWide()) this.sheetExpanded.set(false);
    this.scrollListItemIntoView(memory.memoryId);
  }

  protected selectFromList(memory: MapMemoryView): void {
    this.selectedId.set(memory.memoryId);
    if (!this.isWide()) this.sheetExpanded.set(false);
    this.panToVisible(memory.position, SELECT_MIN_ZOOM);
  }

  /** Splittable cluster → zoom in. Same spot (or max zoom) → list its memories. */
  protected onClusterClick(cluster: Cluster): void {
    const ids = (cluster.markers ?? []).map(memoryIdOf).filter((id): id is number => id !== null);
    const points = ids.map(id => this.byId().get(id)?.position).filter((p): p is LatLng => !!p);
    const mapRef = this.mapInstance();
    if (!mapRef) return;

    const atMaxZoom = (mapRef.getZoom() ?? 0) >= MAX_ZOOM - 1;
    if (isSameSpot(points) || atMaxZoom) {
      this.spotIds.set(new Set(ids));
      this.selectedId.set(null);
      this.sheetExpanded.set(true);
      return;
    }

    const bounds = cluster.bounds ?? this.toLatLngBounds(points);
    if (bounds) mapRef.fitBounds(bounds, this.fitPadding());
  }

  protected showAll(): void {
    this.spotIds.set(null);
  }

  protected clearSelection(): void {
    this.selectedId.set(null);
    this.spotIds.set(null);
    this.sheetExpanded.set(false);
  }

  protected toggleSheet(): void {
    this.sheetExpanded.update(v => !v);
  }

  protected hover(id: number | null): void {
    this.hoveredId.set(id);
  }

  // ── Camera ───────────────────────────────────────────────────────────────

  private fitAll(): void {
    const mapRef = this.mapInstance();
    const points = this.memories().map(m => m.position);
    if (!mapRef || points.length === 0) return;

    if (points.length === 1) {
      mapRef.setCenter(points[0]);
      mapRef.setZoom(SINGLE_MEMORY_ZOOM);
      return;
    }
    const bounds = this.toLatLngBounds(points);
    if (bounds) mapRef.fitBounds(bounds, this.fitPadding());
  }

  private panToVisible(position: LatLng, minZoom: number): void {
    const mapRef = this.mapInstance();
    if (!mapRef) return;
    if ((mapRef.getZoom() ?? 0) < minZoom) mapRef.setZoom(minZoom);
    mapRef.panTo(position);
    if (!this.isWide()) {
      // keep the pin above the bottom sheet
      afterNextRender(() => mapRef.panBy(0, Math.round(this.sheetHeight() / 2)), { injector: this.injector });
    }
  }

  private fitPadding(): google.maps.Padding {
    return this.isWide()
      ? { top: 64, right: 64, bottom: 64, left: 64 }
      : { top: 56, right: 40, bottom: this.sheetHeight() + 32, left: 40 };
  }

  private sheetHeight(): number {
    return this.panel()?.nativeElement.offsetHeight ?? 72;
  }

  private toLatLngBounds(points: LatLng[]): google.maps.LatLngBoundsLiteral | null {
    return boundsOf(points);
  }

  // ── Layout ───────────────────────────────────────────────────────────────

  /** Fills the viewport below whatever the home page renders above the map. */
  private updateHeight(): void {
    const top = this.host.nativeElement.getBoundingClientRect().top + window.scrollY;
    const gap = this.isWide() ? BOTTOM_GAP_DESKTOP : BOTTOM_GAP_PHONE;
    this.viewHeight.set(Math.max(MIN_HEIGHT, Math.round(window.innerHeight - top - gap)));
  }

  private scrollListItemIntoView(id: number): void {
    afterNextRender(() => {
      this.host.nativeElement
        .querySelector(`[data-list-id="${id}"]`)
        ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, { injector: this.injector });
  }
}
