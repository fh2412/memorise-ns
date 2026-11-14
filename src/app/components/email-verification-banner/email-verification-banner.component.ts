import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AuthenticationService } from '@services/authentication.service';
import { AuthFlowService } from '@services/auth/auth-flow.service';

/** Non-blocking reminder for unverified email/password accounts. Place once in the app shell. */
@Component({
  selector: 'app-email-verification-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatIconButton, MatIcon],
  template: `
    @if (visible()) {
      <div class="verify-banner" role="status">
        <mat-icon aria-hidden="true">mark_email_unread</mat-icon>
        <span class="text">Please verify your email address using the link we sent you.</span>
        <div class="actions">
          <button mat-button type="button" (click)="resend()" [disabled]="busy() || resent()">
            {{ resent() ? 'Sent' : 'Resend' }}
          </button>
          <button mat-button type="button" (click)="check()" [disabled]="busy()">I've verified</button>
          <button mat-icon-button type="button" aria-label="Dismiss" (click)="dismissed.set(true)">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>
    }
  `,
  styles: `
    .verify-banner {
      display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px;
      padding: 8px 16px;
      background: var(--mat-sys-tertiary-container, #fff4e5);
      color: var(--mat-sys-on-tertiary-container, inherit);
    }
    .text { flex: 1 1 200px; }
    .actions { display: flex; align-items: center; gap: 4px; margin-left: auto; }
  `,
})
export class EmailVerificationBannerComponent {
  private readonly auth = inject(AuthenticationService);
  private readonly flow = inject(AuthFlowService);

  readonly dismissed = signal(false);
  readonly busy = signal(false);
  readonly resent = signal(false);
  readonly visible = computed(() => this.auth.needsEmailVerification() && !this.dismissed());

  async resend(): Promise<void> {
    this.busy.set(true);
    try {
      await this.auth.resendVerificationEmail();
      this.resent.set(true);
      this.flow.notify('Verification email sent.');
    } catch (error) {
      this.flow.notifyError(error);
    } finally {
      this.busy.set(false);
    }
  }

  async check(): Promise<void> {
    this.busy.set(true);
    try {
      const verified = await this.auth.refreshEmailVerification();
      this.flow.notify(verified ? 'Email verified. Thank you!' : 'Your email is not verified yet.');
    } catch (error) {
      this.flow.notifyError(error);
    } finally {
      this.busy.set(false);
    }
  }
}
