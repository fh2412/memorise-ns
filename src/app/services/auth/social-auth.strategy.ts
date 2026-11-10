import { Injectable, InjectionToken, inject } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import {
  Auth, AuthCredential, AuthProvider, GoogleAuthProvider, OAuthProvider, UserCredential, signInWithPopup
} from '@angular/fire/auth';

export type SocialProvider = 'google' | 'apple';

export const SOCIAL_PROVIDER_LABELS: Record<SocialProvider, string> = {
  google: 'Google',
  apple: 'Apple',
};

/**
 * Platform abstraction for social sign-in.
 * Web: Firebase popup. Later (Capacitor): a NativeSocialAuthStrategy using
 * @capacitor-firebase/authentication with { skipNativeAuth: true } followed by
 * signInWithCredential(auth, GoogleAuthProvider.credential(idToken)) – then provide it
 * for SOCIAL_AUTH_STRATEGY when Capacitor.isNativePlatform() is true. No component changes needed.
 */
export interface SocialAuthStrategy {
  signIn(provider: SocialProvider): Promise<UserCredential>;
  credentialFromError(provider: SocialProvider, error: FirebaseError): AuthCredential | null;
}

@Injectable({ providedIn: 'root' })
export class WebSocialAuthStrategy implements SocialAuthStrategy {
  private readonly auth = inject(Auth);

  signIn(provider: SocialProvider): Promise<UserCredential> {
    return signInWithPopup(this.auth, this.createProvider(provider));
  }

  credentialFromError(provider: SocialProvider, error: FirebaseError): AuthCredential | null {
    return provider === 'google'
      ? GoogleAuthProvider.credentialFromError(error)
      : OAuthProvider.credentialFromError(error);
  }

  private createProvider(provider: SocialProvider): AuthProvider {
    if (provider === 'google') {
      const google = new GoogleAuthProvider();
      google.setCustomParameters({ prompt: 'select_account' });
      return google;
    }
    const apple = new OAuthProvider('apple.com');
    apple.addScope('email');
    apple.addScope('name');
    return apple;
  }
}

export const SOCIAL_AUTH_STRATEGY = new InjectionToken<SocialAuthStrategy>('SOCIAL_AUTH_STRATEGY', {
  providedIn: 'root',
  factory: () => inject(WebSocialAuthStrategy),
});
