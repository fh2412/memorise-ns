import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatFormField, MatLabel, MatInput, MatError, MatSuffix } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { LoadingSpinnerComponent } from '@components/loading-spinner/loading-spinner.component';
import { AuthenticationService, SignInResult } from '@services/authentication.service';
import { AuthFlowService } from '@services/auth/auth-flow.service';
import { AccountLinkRequiredError } from '@services/auth/auth-errors';
import { sanitizeReturnUrl } from '@services/auth/return-url';
import { SOCIAL_PROVIDER_LABELS, SocialProvider } from '@services/auth/social-auth.strategy';
import { SocialLoginButtonsComponent } from '@components/social-login-buttons/social-login-buttons.component';

type BusyAction = 'password' | 'reset' | SocialProvider;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, RouterLink, MatFormField, MatLabel, MatInput, MatError, MatSuffix,
    MatButton, MatIconButton, MatIcon, LoadingSpinnerComponent, SocialLoginButtonsComponent,
  ],
})
export class LoginComponent {
  private readonly auth = inject(AuthenticationService);
  private readonly flow = inject(AuthFlowService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);

  private readonly returnUrl = sanitizeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl'));

  readonly busy = signal<BusyAction | null>(null);
  readonly isBusy = computed(() => this.busy() !== null);
  readonly socialBusy = computed(() => {
    const action = this.busy();
    return action === 'google' || action === 'apple' ? action : null;
  });
  readonly hidePassword = signal(true);
  readonly pendingLink = this.auth.pendingLink;
  readonly providerLabels = SOCIAL_PROVIDER_LABELS;

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    password: ['', [Validators.required]],
  });

  constructor() {
    const pendingEmail = this.pendingLink()?.email;
    if (pendingEmail) this.form.controls.email.setValue(pendingEmail);
  }

  login(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    void this.run('password', () => this.auth.signInWithEmail(email.trim(), password));
  }

  socialLogin(provider: SocialProvider): void {
    void this.run(provider, () => this.auth.signInWithSocial(provider));
  }

  async resetPassword(): Promise<void> {
    if (this.isBusy()) return;
    const email = this.form.controls.email;
    if (email.invalid) {
      email.markAsTouched();
      this.flow.notify('Please enter your email address first.');
      return;
    }

    this.busy.set('reset');
    try {
      await this.auth.sendPasswordReset(email.value.trim());
      this.flow.notify('If an account exists for this email, you will receive a reset link shortly.');
    } catch (error) {
      this.flow.notifyError(error);
    } finally {
      this.busy.set(null);
    }
  }

  cancelLink(): void {
    this.auth.clearPendingLink();
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((hidden) => !hidden);
  }

  private async run(action: BusyAction, signIn: () => Promise<SignInResult>): Promise<void> {
    if (this.isBusy()) return; // prevents double submit
    this.busy.set(action);
    try {
      const result = await signIn();
      await this.flow.complete(result, this.returnUrl);
    } catch (error) {
      if (error instanceof AccountLinkRequiredError && error.email) {
        this.form.patchValue({ email: error.email, password: '' });
      }
      this.flow.notifyError(error);
    } finally {
      this.busy.set(null);
    }
  }
}
