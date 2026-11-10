import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormField, MatLabel, MatInput, MatError, MatHint, MatSuffix } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { LoadingSpinnerComponent } from '@components/loading-spinner/loading-spinner.component';
import { AuthenticationService, SignInResult } from '@services/authentication.service';
import { AuthFlowService } from '@services/auth/auth-flow.service';
import { AccountLinkRequiredError, UserSyncError } from '@services/auth/auth-errors';
import { sanitizeReturnUrl } from '@services/auth/return-url';
import { SocialProvider } from '@services/auth/social-auth.strategy';
import {
  ConfirmPasswordErrorStateMatcher, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, notBlankValidator, passwordsMatchValidator
} from '@services/auth/password.validators';
import { SocialLoginButtonsComponent } from '@components/social-login-buttons/social-login-buttons.component';


type BusyAction = 'register' | SocialProvider;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, RouterLink, MatFormField, MatLabel, MatInput, MatError, MatHint, MatSuffix,
    MatButton, MatIconButton, MatIcon, LoadingSpinnerComponent, SocialLoginButtonsComponent,
  ],
})
export class RegisterComponent {
  private readonly auth = inject(AuthenticationService);
  private readonly flow = inject(AuthFlowService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly returnUrl = sanitizeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl'));

  readonly passwordMinLength = PASSWORD_MIN_LENGTH;
  readonly confirmMatcher = new ConfirmPasswordErrorStateMatcher();
  readonly busy = signal<BusyAction | null>(null);
  readonly isBusy = computed(() => this.busy() !== null);
  readonly socialBusy = computed(() => {
    const action = this.busy();
    return action === 'google' || action === 'apple' ? action : null;
  });
  readonly hidePassword = signal(true);

  readonly form = this.fb.group(
    {
      displayName: ['', [Validators.required, Validators.maxLength(100), notBlankValidator]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
      password: ['', [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH), Validators.maxLength(PASSWORD_MAX_LENGTH)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator('password', 'confirmPassword') }
  );

  register(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { displayName, email, password } = this.form.getRawValue();
    void this.run('register', () =>
      this.auth.register({ displayName: displayName.trim(), email: email.trim(), password })
    );
  }

  socialLogin(provider: SocialProvider): void {
    void this.run(provider, () => this.auth.signInWithSocial(provider));
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((hidden) => !hidden);
  }

  private async run(action: BusyAction, signIn: () => Promise<SignInResult>): Promise<void> {
    if (this.isBusy()) return;
    this.busy.set(action);
    try {
      const result = await signIn();
      await this.flow.complete(result, this.returnUrl);
    } catch (error) {
      if (action === 'register' && error instanceof UserSyncError) {
        // Firebase account exists; next sign-in creates the DB user (POST /users/me is idempotent)
        this.flow.notify('Your account was created, but setup could not finish. Please sign in.');
        await this.router.navigate(['/login'], { queryParamsHandling: 'preserve' });
        return;
      }
      this.flow.notifyError(error);
      if (error instanceof AccountLinkRequiredError) {
        await this.router.navigate(['/login'], { queryParamsHandling: 'preserve' });
      }
    } finally {
      this.busy.set(null);
    }
  }
}
