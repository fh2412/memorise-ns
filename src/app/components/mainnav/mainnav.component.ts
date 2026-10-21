import { Component, inject, viewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';
import { ThemeService } from '@services/theme.service';
import { MatSidenavContainer, MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { MatNavList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { FeedbackButtonComponent } from '../feedback-button/feedback-button.component';
import { ThemeSwitcherComponent } from '../theme-switcher/theme-switcher.component';
import { SubscriptionStatusComponent } from '../subscription-status/subscription-status.component';
import { AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-nav',
  templateUrl: './mainnav.component.html',
  styleUrls: ['./mainnav.component.scss'],
  imports: [
    MatSidenavContainer,
    MatSidenav,
    MatToolbar,
    MatNavList,
    MatListItem,
    MatIcon,
    FeedbackButtonComponent,
    ThemeSwitcherComponent,
    SubscriptionStatusComponent,
    MatSidenavContent,
    RouterOutlet,
    RouterLink,
    AsyncPipe,
  ],
})
export class MainNavComponent {
  private breakpointObserver = inject(BreakpointObserver);
  private readonly content = viewChild(MatSidenavContent);
  protected readonly themeService = inject(ThemeService);

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor() {
    inject(Router).events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.content()?.scrollTo({ top: 0 }));
  }
}
