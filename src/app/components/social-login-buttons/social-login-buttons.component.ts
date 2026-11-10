import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { LoadingSpinnerComponent } from '@components/loading-spinner/loading-spinner.component';
import { SocialProvider } from '@services/auth/social-auth.strategy';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-social-login-buttons',
  templateUrl: './social-login-buttons.component.html',
  styleUrl: './social-login-buttons.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, LoadingSpinnerComponent],
})
export class SocialLoginButtonsComponent {
  readonly busyProvider = input<SocialProvider | null>(null);
  readonly disabled = input(false);
  readonly selected = output<SocialProvider>();

  readonly showGoogle = environment.authProviders.google;
  readonly showApple = environment.authProviders.apple;
}
