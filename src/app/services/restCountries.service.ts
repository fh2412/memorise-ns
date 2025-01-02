import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Country {
  name: string;
  flag: string;
  region: string;
}

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  constructor(private http: HttpClient) { }

  getCountries(): Observable<Country[]> {
    return this.http.get<any>('https://restcountries.com/v3.1/all?fields=name,flag,region')
      .pipe(
        map(countries => countries.map((country: { name: { common: any;}; flag: any; region: any; }) => ({
          name: country.name.common, 
          flag: country.flag,
          region: country.region
        }) as Country)) 
      );
  }
}