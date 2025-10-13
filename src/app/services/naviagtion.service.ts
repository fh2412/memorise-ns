// navigation.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private cameFromInvite = false;

  setCameFromInvite(value: boolean): void {
    this.cameFromInvite = value;
  }

  getCameFromInvite(): boolean {
    return this.cameFromInvite;
  }

  reset(): void {
    this.cameFromInvite = false;
  }
}