import { Component, inject, OnInit } from '@angular/core';
import { MemorystatsService } from '../../services/memorystats.service';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../services/userService';
import { VisitedCountry } from '../../models/memoryInterface.model';

@Component({
  selector: 'app-visited-country-map',
  imports: [],
  templateUrl: './visited-country-map.component.html',
  styleUrl: './visited-country-map.component.scss'
})
export class VisitedCountryMapComponent implements OnInit{

  memoryStatsService = inject(MemorystatsService);
  userService = inject(UserService);
  countryList: VisitedCountry[] = [];
  loggedInUserId = '';

  async ngOnInit(): Promise<void> {
    await this.getLoggedInUserId();
    this.getVisitedCountries(this.loggedInUserId);
  }

  async getLoggedInUserId(){
    this.loggedInUserId = await this.userService.getLoggedInUserId() || '';
    console.log("LoggedINUser: ", this.loggedInUserId);
  }

  async getVisitedCountries(userId: string){
    console.log(userId);
    this.countryList = await firstValueFrom(this.memoryStatsService.getVisitedCountries(userId));
    console.log("Visited Countries: ", this.countryList);
  }
}
