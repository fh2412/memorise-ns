import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ThemeService } from '@services/theme.service';
import { MatSidenavContainer, MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { MatNavList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { FeedbackButtonComponent } from '../feedback-button/feedback-button.component';
import { ThemeSwitcherComponent } from '../theme-switcher/theme-switcher.component';
import { SubscriptionStatusComponent } from '../subscription-status/subscription-status.component';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-main-nav',
    templateUrl: './mainnav.component.html',
    styleUrls: ['./mainnav.component.scss'],
    imports: [MatSidenavContainer, MatSidenav, MatToolbar, MatNavList, MatListItem, MatIcon, FeedbackButtonComponent, ThemeSwitcherComponent, SubscriptionStatusComponent, MatSidenavContent, RouterOutlet, AsyncPipe]
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
