import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface Country {
  name: string;
  flag: string;
  region: string;
}

export interface Geocords {
  lat: number;
  long: number;
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

  getCountriesGeocords(countryname: string): Observable<Geocords[]> {
    return this.http.get<any>(`https://restcountries.com/v3.1/name/${countryname}?fields=latlng`)
      .pipe(
        map(countries => countries.map((country: { latlng: number[] }) => ({
          lat: country.latlng[0],
          long: country.latlng[1]
        }) as Geocords))
      );
  }

  getCountryGeocordsByUserId(userId: string): Observable<Geocords[]> {
    return this.http.get<any>(`http://localhost:3000/api/users/country/${userId}`)
      .pipe(
        switchMap(countryResponse => {
          const countryName = countryResponse.country;
          if(countryName == null){
            return this.getCountriesGeocords("Austria");
          }
          return this.getCountriesGeocords(countryName);
        })
      );
  }
  
  
}