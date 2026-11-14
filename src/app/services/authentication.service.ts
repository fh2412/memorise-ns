import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { FirebaseError } from '@angular/fire/app';
import {
  Auth, AuthCredential, User, UserCredential, authState, createUserWithEmailAndPassword, linkWithCredential,
  reload, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile
} from '@angular/fire/auth';
import { firstValueFrom, retry, throwError, timer } from 'rxjs';
import { environment } from '../../environments/environment';
import { AccountLinkRequiredError, UserSyncError, getAuthErrorCode } from './auth/auth-errors';
import { SOCIAL_AUTH_STRATEGY, SocialProvider } from './auth/social-auth.strategy';

export interface AppUserProfile {
  id: string;
  email: string | null;
  name: string;
}

export interface SignInResult {
  isNewUser: boolean;
  profile: AppUserProfile;
  linkedProvider?: SocialProvider;
}

export interface RegisterInput {
  displayName: string;
  email: string;
  password: string;
}

interface SyncUserResponse {
  isNewUser: boolean;
  user: AppUserProfile;
}

interface PendingLink {
  provider: SocialProvider;
  email: string | null;
  credential: AuthCredential;
}

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private readonly auth = inject(Auth);
  private readonly http = inject(HttpClient);
  private readonly social = inject(SOCIAL_AUTH_STRATEGY);
  private readonly usersUrl = `${environment.apiUrl}/users`;

  readonly currentUser = toSignal(authState(this.auth), { initialValue: null });

  /** Bumped after reload() because User.emailVerified is not reactive. */
  private readonly verificationTick = signal(0);
  readonly needsEmailVerification = computed(() => {
    this.verificationTick();
    const user = this.currentUser();
    return !!user && !user.emailVerified && user.providerData.some((p) => p.providerId === 'password');
  });

  /** Credential kept in memory only (never persisted) until the user signs in with the existing method. */
  private readonly pendingLinkState = signal<PendingLink | null>(null);
  readonly pendingLink = computed(() => {
    const pending = this.pendingLinkState();
    return pending ? { provider: pending.provider, email: pending.email } : null;
  });

  // ---------- Sign-in / Registration ----------

  async signInWithEmail(email: string, password: string): Promise<SignInResult> {
    const { user } = await signInWithEmailAndPassword(this.auth, email, password);
    const linkedProvider = await this.linkPendingCredential(user);
    return this.syncUserOrSignOut(null, linkedProvider);
  }

  async signInWithSocial(provider: SocialProvider): Promise<SignInResult> {
    let credential: UserCredential;
    try {
      credential = await this.social.signIn(provider);
    } catch (error) {
      if (getAuthErrorCode(error) === 'auth/account-exists-with-different-credential') {
        const firebaseError = error as FirebaseError;
        const pending = this.social.credentialFromError(provider, firebaseError);
        const email = (firebaseError.customData?.['email'] as string | undefined) ?? null;
        if (pending && email) {
          this.pendingLinkState.set({ provider, email, credential: pending });
          throw new AccountLinkRequiredError(email, provider);
        }
      }
      throw error;
    }

    const linkedProvider = await this.linkPendingCredential(credential.user);
    return this.syncUserOrSignOut(credential.user.displayName, linkedProvider);
  }

  async register({ displayName, email, password }: RegisterInput): Promise<SignInResult> {
    const { user } = await createUserWithEmailAndPassword(this.auth, email, password);

    // Non-critical steps: never fail the registration because of them
    await updateProfile(user, { displayName }).catch((e) => console.warn('updateProfile failed', getAuthErrorCode(e)));
    sendEmailVerification(user).catch((e) => console.warn('sendEmailVerification failed', getAuthErrorCode(e)));

    return this.syncUserOrSignOut(displayName);
  }

  /** Always resolves for unknown emails (no account enumeration). */
  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      if (getAuthErrorCode(error) === 'auth/user-not-found') return;
      throw error;
    }
  }

  async signOut(): Promise<void> {
    this.pendingLinkState.set(null);
    await signOut(this.auth);
  }

  clearPendingLink(): void {
    this.pendingLinkState.set(null);
  }

  // ---------- Email verification (reminder only) ----------

  async resendVerificationEmail(): Promise<void> {
    const user = this.auth.currentUser;
    if (user && !user.emailVerified) await sendEmailVerification(user);
  }

  async refreshEmailVerification(): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) return false;
    await reload(user);
    if (user.emailVerified) await user.getIdToken(true); // refresh email_verified claim for the backend
    this.verificationTick.update((v) => v + 1);
    return user.emailVerified;
  }

  // ---------- Internals ----------

  /** Links a pending social credential – only if the signed-in account has the same email. */
  private async linkPendingCredential(user: User): Promise<SocialProvider | undefined> {
    const pending = this.pendingLinkState();
    if (!pending) return undefined;
    this.pendingLinkState.set(null);

    if (!pending.email || user.email?.toLowerCase() !== pending.email.toLowerCase()) return undefined;

    try {
      await linkWithCredential(user, pending.credential);
      return pending.provider;
    } catch (error) {
      const code = getAuthErrorCode(error);
      if (code !== 'auth/provider-already-linked') console.warn('Account linking failed', code);
      return undefined;
    }
  }

  /** Ensures the MySQL user exists. On failure the session is ended so the app never runs half-signed-in. */
  private async syncUserOrSignOut(displayName: string | null, linkedProvider?: SocialProvider): Promise<SignInResult> {
    try {
      const response = await firstValueFrom(
        this.http.post<SyncUserResponse>(`${this.usersUrl}/me`, { displayName: displayName?.trim() || null }).pipe(
          retry({
            count: 2,
            delay: (error: HttpErrorResponse, attempt) =>
              error.status === 0 || error.status >= 500 ? timer(attempt * 500) : throwError(() => error),
          })
        )
      );
      return { isNewUser: response.isNewUser, profile: response.user, linkedProvider };
    } catch (error) {
      await signOut(this.auth).catch(() => undefined);
      throw new UserSyncError(error);
    }
  }
}
