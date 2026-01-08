import { Component, ElementRef, inject, OnInit, ViewChild, input } from '@angular/core';
import { MemorystatsService } from '@services/memorystats.service';
import { firstValueFrom } from 'rxjs';
import { UserService } from '@services/userService';
import { VisitedCountry } from '@models/memoryInterface.model';
import * as d3 from 'd3';
import { ThemeService } from '@services/theme.service';
import { FeatureCollection, Feature, Geometry } from 'geojson';

interface CountryProperties {
  'ISO3166-1-Alpha-2': string;
  'ISO3166-1-Alpha-3': string;
  name: string;
}

type CountryFeature = Feature<Geometry, CountryProperties>;

@Component({
  selector: 'app-visited-country-map',
  imports: [],
  templateUrl: './visited-country-map.component.html',
  styleUrl: './visited-country-map.component.scss'
})
export class VisitedCountryMapComponent implements OnInit {
  @ViewChild('mapSvg', { static: true }) private svgRef!: ElementRef<SVGElement>;
  readonly userId = input('');
  memoryStatsService = inject(MemorystatsService);
  userService = inject(UserService);
  themeService = inject(ThemeService);
  countryList: VisitedCountry[] = [];
  loggedInUserId = '';
  fillBackgroudColor = '#e2e2e8';
  countryStrokeColor = '#c3c6d2';
  unvisitedColor = '#f9f9ff';
  visitedColor = '#FFA500';
  
  private svg!: d3.Selection<SVGElement, unknown, null, undefined>;
  private g!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private projection!: d3.GeoProjection;
  private path!: d3.GeoPath<unknown, d3.GeoPermissibleObjects>;
  private marginTop = 24;
  private width = 928;
  private height = this.width / 2 + this.marginTop;
  private activeCountry: CountryFeature | null = null;
  private hoverTimeout: ReturnType<typeof setTimeout> | null = null;

  async ngOnInit(): Promise<void> {
    const userId = this.userId();
    if(userId == ''){
      await this.getLoggedInUserId();
    }
    else{
      this.loggedInUserId = userId
    }
    await this.getVisitedCountries(this.loggedInUserId);
    this.setDarkmodeColors();
    this.loadMapData();
  }

  async getLoggedInUserId(): Promise<void> {
    this.loggedInUserId = await this.userService.getLoggedInUserId() || '';
  }

  async getVisitedCountries(userId: string): Promise<void> {
    this.countryList = await firstValueFrom(this.memoryStatsService.getVisitedCountries(userId));
    if(this.countryList === null){
      this.countryList = []
    }
  }

  setDarkmodeColors(): void {
    if (this.themeService.isDarkMode()) {
      this.fillBackgroudColor = '#1a1c20';
      this.countryStrokeColor = '#424750';
      this.unvisitedColor = '#111318';
      this.visitedColor = '#ffb95c';
    }
  }

  private async loadMapData(): Promise<void> {
    try {
      const countriesData = await d3.json<FeatureCollection<Geometry, CountryProperties>>(
        'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson'
      );
      if (countriesData) {
        this.createMap(countriesData);
      }
    } catch (error) {
      console.error('Error loading map data:', error);
    }
  }

  private createMap(countriesData: FeatureCollection<Geometry, CountryProperties>): void {
    const visitedCodes = new Set(
      this.countryList
        .map(c => c.alpha_2_codes)
        .filter((code): code is string => code !== null)
    );

    // Setup projection with better padding
    this.projection = d3.geoEqualEarth()
      .fitExtent([[10, this.marginTop + 10], [this.width - 10, this.height - 10]], countriesData);
    this.path = d3.geoPath(this.projection);

    // Create SVG
    this.svg = d3.select(this.svgRef.nativeElement)
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .attr('style', 'max-width: 100%; height: auto;');

    // Add zoom behavior (without dragging)
    const zoom = d3.zoom<SVGElement, unknown>()
      .scaleExtent([1, 8])
      .filter(() => {
        // Disable all default zoom interactions (scroll, drag, etc.)
        return false;
      })
      .on('zoom', (event: d3.D3ZoomEvent<SVGElement, unknown>) => {
        this.g.attr('transform', event.transform.toString());
      });

    this.svg.call(zoom);

    // Create container group for zoomable content
    this.g = this.svg.append('g');

    // Add background sphere
    this.g.append("path")
      .datum({ type: "Sphere" } as d3.GeoPermissibleObjects)
      .attr("fill", this.fillBackgroudColor)
      .attr("stroke", this.countryStrokeColor)
      .attr("stroke-width", 1)
      .attr("d", this.path);

    // Add countries with click and hover handlers
    const countries = this.g.append('g')
      .selectAll('path')
      .data(countriesData.features)
      .join('path')
      .attr('class', 'country')
      .attr('fill', (d: CountryFeature) => {
        const alpha2 = d.properties['ISO3166-1-Alpha-2'];
        return visitedCodes.has(alpha2) ? this.visitedColor : this.unvisitedColor;
      })
      .attr('d', this.path)
      .attr('stroke', 'white')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .style('transition', 'fill 0.2s ease');

    // Add mouse event handlers
    countries.on('mouseenter', (event: MouseEvent, d: CountryFeature) => {
      // Clear any existing timeout
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
      }

      // Highlight country immediately
      const target = event.currentTarget as SVGPathElement;
      d3.select(target)
        .attr('fill', () => {
          const alpha2 = d.properties['ISO3166-1-Alpha-2'];
          const baseColor = visitedCodes.has(alpha2) ? this.visitedColor : this.unvisitedColor;
          return d3.color(baseColor)?.darker(0.3).toString() || baseColor;
        });

      // Delay tooltip appearance for smoother experience
      this.hoverTimeout = setTimeout(() => {
        this.showTooltip(event, d, visitedCodes);
      }, 200);
    });

    countries.on('mouseleave', (event: MouseEvent, d: CountryFeature) => {
      // Clear timeout if mouse leaves before tooltip appears
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }

      // Remove highlight
      const target = event.currentTarget as SVGPathElement;
      d3.select(target)
        .attr('fill', () => {
          const alpha2 = d.properties['ISO3166-1-Alpha-2'];
          return visitedCodes.has(alpha2) ? this.visitedColor : this.unvisitedColor;
        });

      this.hideTooltip();
    });

    countries.on('click', (event: MouseEvent, d: CountryFeature) => {
      event.stopPropagation();
      
      // If clicking the same country, reset zoom
      if (this.activeCountry === d) {
        this.resetZoom(zoom);
      } else {
        this.zoomToCountry(d, zoom);
      }
    });

    // Add reset zoom on background click
    this.svg.on('click', (event: MouseEvent) => {
      // Only reset if clicking directly on the SVG background, not on countries
      if (event.target === this.svgRef.nativeElement) {
        this.resetZoom(zoom);
      }
    });

    // Add tooltip container
    this.createTooltip();
  }

  private zoomToCountry(d: CountryFeature, zoom: d3.ZoomBehavior<SVGElement, unknown>): void {
    const bounds = this.path.bounds(d);
    const [[x0, y0], [x1, y1]] = bounds;
    const centerX = (x0 + x1) / 2;
    const centerY = (y0 + y1) / 2;

    // Calculate scale to fit the country
    const dx = x1 - x0;
    const dy = y1 - y0;
    const scale = Math.min(8, 0.9 / Math.max(dx / this.width, dy / this.height));

    // Store active country
    this.activeCountry = d;

    this.svg.transition()
      .duration(750)
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate(this.width / 2, this.height / 2)
          .scale(scale)
          .translate(-centerX, -centerY)
      );
  }

  private resetZoom(zoom: d3.ZoomBehavior<SVGElement, unknown>): void {
    if (this.activeCountry) {
      this.activeCountry = null;
      this.svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
    }
  }

  private createTooltip(): void {
    d3.select('body').append('div')
      .attr('class', 'map-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', this.themeService.isDarkMode() ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)')
      .style('color', this.themeService.isDarkMode() ? '#fff' : '#333')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '14px')
      .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('opacity', '0')
      .style('transition', 'opacity 0.15s ease-in');
  }

  private showTooltip(event: MouseEvent, d: CountryFeature, visitedCodes: Set<string>): void {
    const tooltip = d3.select('.map-tooltip');
    const countryName = d.properties.name;
    const alpha2 = d.properties['ISO3166-1-Alpha-2'];
    const status = visitedCodes.has(alpha2) ? '✓ Visited' : 'Not visited';

    tooltip
      .html(`<strong>${countryName}</strong><br/>${status}`)
      .style('left', `${event.pageX + 10}px`)
      .style('top', `${event.pageY - 10}px`)
      .style('visibility', 'visible')
      .transition()
      .duration(150)
      .style('opacity', '1');
  }

  private hideTooltip(): void {
    const tooltip = d3.select('.map-tooltip');
    tooltip
      .transition()
      .duration(100)
      .style('opacity', '0')
      .on('end', () => {
        tooltip.style('visibility', 'hidden');
      });
  }
}