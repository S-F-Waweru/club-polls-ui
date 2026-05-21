import { Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  template: `
    <div class="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
         style="background: var(--bg-app);">

      <!-- Grid overlay -->
      <div class="absolute inset-0 pointer-events-none" style="
        background-image:
          linear-gradient(var(--grid-line) 1px, transparent 1px),
          linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
        background-size: 40px 40px;">
      </div>

      <!-- Ambient glow -->
      <div class="absolute top-1/4 left-1/3 w-96 h-96 rounded-full pointer-events-none" style="
        background: radial-gradient(circle, color-mix(in srgb, var(--primary-500) 10%, transparent) 0%, transparent 70%);
        filter: blur(48px);">
      </div>

      <!-- Card -->
      <div class="relative z-10 w-full max-w-md mx-4 rounded-xl border p-8 backdrop-blur-xl" style="
        background: color-mix(in srgb, var(--bg-panel) 60%, transparent);
        border-color: var(--border-default);
        box-shadow: 0 0 0 1px var(--border-brand), 0 32px 64px rgba(0,0,0,0.15);">

        <!-- Header -->
        <div class="flex flex-col items-center gap-3 mb-8">
          <div class="flex items-center justify-center w-12 h-12 rounded-lg border" style="
            background: color-mix(in srgb, var(--primary-500) 10%, transparent);
            border-color: color-mix(in srgb, var(--primary-500) 20%, transparent);">
            <i [class]="iconClass() + ' text-xl'" style="color: var(--primary-500)"></i>
          </div>
          <div class="text-center">
            <h1 class="text-xl font-semibold tracking-tight" style="color: var(--text-primary)">
              {{ title() }}
            </h1>
            <p class="text-sm mt-0.5" style="color: var(--text-muted)">{{ subtitle() }}</p>
          </div>
        </div>

        <!-- Slot -->
        <ng-content></ng-content>

      </div>
    </div>
  `,
})
export class AuthShellComponent {
  title     = input.required<string>();
  subtitle  = input.required<string>();
  iconClass = input<string>('pi pi-lock');
}
