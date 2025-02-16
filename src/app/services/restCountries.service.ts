import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Country {
  name: string;
  flag: string;
  region: string;
}

interface RawCountry {
  name: { common: string };
  flag: string;
  region: string;
}


interface Geocords {
  lat: number;
  long: number;
}

interface RawCountryGeocords {
  latlng: [number, number];
}

interface UserCountryResponse {
  country: string;
}

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  getCountries(): Observable<Country[]> {
    return this.http.get<RawCountry[]>('https://restcountries.com/v3.1/all?fields=name,flag,region').pipe(
      map(countries =>
        countries.map(country => ({
          name: country.name.common,
          flag: country.flag,
          region: country.region,
        }))
      )
    );
  }

  getCountriesGeocords(countryname: string): Observable<Geocords[]> {
    return this.http.get<RawCountryGeocords[]>(`https://restcountries.com/v3.1/name/${countryname}?fields=latlng`).pipe(
      map(countries =>
        countries.map(country => ({
          lat: country.latlng[0],
          long: country.latlng[1],
        }))
      )
    );
  }

  getCountryGeocordsByUserId(userId: string): Observable<Geocords[]> {
    return this.http.get<UserCountryResponse>(`${this.apiUrl}/users/country/${userId}`)
      .pipe(
        switchMap(countryResponse => {
          const countryName = countryResponse.country;
          if (countryName == null) {
            return this.getCountriesGeocords("Austria");
          }
          return this.getCountriesGeocords(countryName);
        })
      );
  }
}