import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ThemeService } from '@services/theme.service';

@Component({
    selector: 'app-main-nav',
    templateUrl: './mainnav.component.html',
    styleUrls: ['./mainnav.component.scss'],
    standalone: false
})
export class MainNavComponent {
  private breakpointObserver = inject(BreakpointObserver);

  protected readonly themeService = inject(ThemeService);

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
}
