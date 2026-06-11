import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

import { providePrimeNG } from 'primeng/config';

import { AppPreset } from './core/theme';
import { AuthService } from './services/auth.services';
import { AuthStore } from './state/auth.store';
import { ConfirmationService, MessageService } from 'primeng/api';

// ❌ WRONG: AuthStore is being used as a Type hint in the parameter list
export function initializeAuthFactory(
  authService: AuthService,
  authStore: InstanceType<typeof AuthStore>,
) {
  return () =>
    authService.checkSessionOnStartup().then((user) => {
      authStore.hydrateSession(user);
    });
}

export const appConfig: ApplicationConfig = {
  providers: [
    ConfirmationService,
    MessageService,
    provideHttpClient(withInterceptors([authInterceptor])),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: AppPreset,
        options: {
          darkModeSelector: 'dark', // add class="dark" to <html> to switch
          cssLayer: {
            name: 'primeng',
            // Tells Tailwind v4 to evaluate theme first, then base, then component styles
            order: 'theme, base, primeng',
          },
        },
      },
    }),
    // 🔐 Blocks app rendering until backend cookie validation finishes
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuthFactory,
      deps: [AuthService, AuthStore],
      multi: true,
    },
  ],
};
