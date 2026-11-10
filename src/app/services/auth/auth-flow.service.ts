import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationService, SignInResult } from '../authentication.service';
import { toAuthErrorMessage } from './auth-errors';
import { SOCIAL_PROVIDER_LABELS } from './social-auth.strategy';

/** Shared UI logic after sign-in/registration (snackbars + navigation). */
@Injectable({ providedIn: 'root' })
export class AuthFlowService {
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly auth = inject(AuthenticationService);

  async complete(result: SignInResult, returnUrl: string): Promise<void> {
    if (result.isNewUser) {
      const verifyHint = this.auth.needsEmailVerification() ? ' Please check your inbox to verify your email.' : '';
      this.notify(`Welcome to Memorise, ${result.profile.name}!${verifyHint}`, 8000);
    } else if (result.linkedProvider) {
      this.notify(`${SOCIAL_PROVIDER_LABELS[result.linkedProvider]} is now linked to your account.`);
    }
    await this.router.navigateByUrl(returnUrl, { replaceUrl: true });
  }

  notifyError(error: unknown): void {
    const message = toAuthErrorMessage(error);
    if (message) this.notify(message);
  }

  notify(message: string, duration = 5000): void {
    this.snackBar.open(message, 'OK', { duration });
  }
}
