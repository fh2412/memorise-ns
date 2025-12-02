import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MemorystatsService } from '../../services/memorystats.service';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../services/userService';
import { VisitedCountry } from '../../models/memoryInterface.model';
import * as d3 from 'd3';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-visited-country-map',
  imports: [],
  templateUrl: './visited-country-map.component.html',
  styleUrl: './visited-country-map.component.scss'
})
export class VisitedCountryMapComponent implements OnInit {
  @ViewChild('mapSvg', { static: true }) private svgRef!: ElementRef<SVGElement>;


  memoryStatsService = inject(MemorystatsService);
  userService = inject(UserService);
  themeService = inject(ThemeService);
  countryList: VisitedCountry[] = [];
  loggedInUserId = '';
  fillBackgroudColor = '#e2e2e8';
  countryStrokeColor = '#c3c6d2';
  unvisitedColor = '#f9f9ff';
  visitedColor = '#FFA500';

  private svg: any;
  private marginTop = 24;
  private width = 928;
  private height = this.width / 2 + this.marginTop;

  async ngOnInit(): Promise<void> {
    await this.getLoggedInUserId();
    this.getVisitedCountries(this.loggedInUserId);
    this.setDarkmodeColors();
    this.loadMapData();
  }

  async getLoggedInUserId() {
    this.loggedInUserId = await this.userService.getLoggedInUserId() || '';
    console.log("LoggedINUser: ", this.loggedInUserId);
  }

  async getVisitedCountries(userId: string) {
    console.log(userId);
    this.countryList = await firstValueFrom(this.memoryStatsService.getVisitedCountries(userId));
    console.log("Visited Countries: ", this.countryList);
  }

  async setDarkmodeColors() {
    if (this.themeService.isDarkMode()) {
      this.fillBackgroudColor = '#1a1c20';
      this.countryStrokeColor = '#424750';
      this.unvisitedColor = '#111318';
      this.visitedColor = '#ffb95c';
    }
  }

  private async loadMapData(): Promise<void> {
    try {
      const countriesData = await d3.json('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
      this.createMap(countriesData);
    } catch (error) {
      console.error('Error loading map data:', error);
    }
  }

  private createMap(countriesData: any): void {
    const visitedCodes = new Set(
      this.countryList
        .map(c => c.alpha_2_codes)
        .filter(code => code !== null)
    );

    // Setup projection with better padding
    const projection = d3.geoEqualEarth()
      .fitExtent([[10, this.marginTop + 10], [this.width - 10, this.height - 10]], countriesData);
    const path = d3.geoPath(projection);

    // Create SVG
    this.svg = d3.select(this.svgRef.nativeElement)
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .attr('style', 'max-width: 100%; height: auto;');

    // Add background sphere
    this.svg.append("path")
      .datum({ type: "Sphere" })
      .attr("fill", this.fillBackgroudColor)
      .attr("stroke", this.countryStrokeColor)
      .attr("stroke-width", 1)
      .attr("d", path);

    // Add countries
    this.svg.append('g')
      .selectAll('path')
      .data(countriesData.features)
      .join('path')
      .attr('fill', (d: any) => {
        const alpha2: string = d.properties['ISO3166-1-Alpha-2'];
        return visitedCodes.has(alpha2) ? this.visitedColor : this.unvisitedColor;
      })
      .attr('d', path)
      .attr('stroke', 'white')
      .attr('stroke-width', 0.5)
      .append('title')
      .text((d: any) => {
        const countryName = d.properties.name;
        const alpha2 = d.properties['ISO3166-1-Alpha-2'];
        const status = visitedCodes.has(alpha2) ? 'Visited' : 'Not visited';
        return `${countryName}\n${status}`;
      });
  }
}
