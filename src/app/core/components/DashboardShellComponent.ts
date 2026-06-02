import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { AuthStore } from '../../state/auth.store';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, Menu],
  styles: [
    `
      /* Layout structure */
      .layout-container {
        display: grid;
        grid-template-columns: auto 1fr;
        height: 100vh;
        overflow: hidden;
      }

      .main-scroll-area {
        height: 100vh;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        flex: 1;
      }

      /* ─── Sidebar ─── */
      .sidebar {
        width: 240px;
        min-width: 240px;
        transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: width;
        display: flex;
        flex-direction: column;
        height: 100vh;
      }
      .sidebar.collapsed { width: 64px; min-width: 64px; }

      .sidebar.collapsed .nav-label,
      .sidebar.collapsed .nav-badge,
      .sidebar.collapsed .nav-group-label,
      .sidebar.collapsed .logo-text,
      .sidebar.collapsed .sidebar-footer-text {
        opacity: 0; pointer-events: none; width: 0; overflow: hidden;
      }

      .nav-label, .nav-badge, .nav-group-label, .logo-text {
        transition: opacity 0.2s ease, width 0.25s ease;
        white-space: nowrap;
      }

      .nav-item {
        display: flex; align-items: center; gap: 10px; padding: 8px 10px;
        border-radius: var(--radius-sm); cursor: pointer; color: var(--text-muted);
        font-size: 0.825rem; font-weight: 500; transition: background 0.15s, color 0.15s;
        text-decoration: none; position: relative;
      }
      .nav-item:hover { background: var(--bg-subtle); color: var(--text-primary); }
      .nav-item.active { background: color-mix(in srgb, var(--primary-500) 10%, transparent); color: var(--primary-600); }
      .nav-item .nav-icon { font-size: 1rem; flex-shrink: 0; width: 20px; text-align: center; }

      .nav-item.active::before {
        content: ''; position: absolute; left: 0; top: 20%; height: 60%; width: 3px;
        border-radius: 0 2px 2px 0; background: var(--primary-500);
      }

      .sidebar.collapsed .nav-item { justify-content: center; padding: 10px; }
      .sidebar.collapsed .nav-item:hover::after {
        content: attr(data-label); position: absolute; left: calc(100% + 10px); top: 50%;
        transform: translateY(-50%); background: var(--bg-panel); border: 1px solid var(--border-default);
        color: var(--text-primary); font-size: 0.75rem; padding: 4px 10px; border-radius: var(--radius-sm);
        white-space: nowrap; box-shadow: var(--shadow-lg); z-index: 100;
      }

      .sidebar-nav::-webkit-scrollbar { width: 3px; }
      .sidebar-nav::-webkit-scrollbar-thumb { background: var(--border-muted); border-radius: 99px; }

      .grid-overlay {
        background-image: linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
        background-size: 40px 40px;
      }

      @media (max-width: 768px) {
        .layout-container { grid-template-columns: 1fr; }
        .sidebar { position: fixed; z-index: 50; transform: translateX(-100%); transition: transform 0.25s; }
        .sidebar.mobile-open { transform: translateX(0); }
      }
    `,
  ],
  template: `
    <div class="layout-container font-sans" [style.background]="'var(--bg-app)'" [style.color]="'var(--text-primary)'">
      <div class="absolute inset-0 pointer-events-none opacity-60 grid-overlay"></div>

      @if (mobileOpen()) { <div class="fixed inset-0 bg-black/40 z-40" (click)="mobileOpen.set(false)"></div> }

      <aside class="sidebar border-r" [class.collapsed]="collapsed()" [class.mobile-open]="mobileOpen()" [style.background]="'var(--bg-panel)'" [style.borderColor]="'var(--border-default)'">
        <div class="flex items-center gap-3 px-4 py-4 border-b" [style.borderColor]="'var(--border-default)'" style="min-height: 61px;">
          <div class="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center" [style.background]="'var(--primary-600)'" style="color: #fff;">
            <i class="pi pi-bolt"></i>
          </div>
          <span class="logo-text font-semibold text-sm tracking-tight">AdminHQ</span>
        </div>

        <nav class="sidebar-nav flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-1">
          @for (group of navGroups(); track group.group) {
            <div class="mb-1">
              <p class="nav-group-label px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest" [style.color]="'var(--text-ghost)'">{{ group.group }}</p>
              @for (item of group.items; track item.route) {
                <a [routerLink]="item.route" routerLinkActive="active" class="nav-item" [attr.data-label]="item.label">
                  <i class="nav-icon pi {{ item.icon }}"></i>
                  <span class="nav-label flex-1">{{ item.label }}</span>
                  @if (item.badge) { <span class="nav-badge text-[10px] font-semibold px-1.5 py-0.5 rounded-full" [style.background]="'color-mix(in srgb, var(--primary-500) 15%, transparent)'" [style.color]="'var(--primary-600)'">{{ item.badge }}</span> }
                </a>
              }
            </div>
          }
        </nav>

        <div class="px-2 py-3 border-t" [style.borderColor]="'var(--border-default)'">
          <div class="nav-item cursor-pointer" (click)="menu.toggle($event)">
            <div class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" [style.background]="'var(--primary-600)'" style="color: #fff;">JD</div>
            <div class="nav-label flex flex-col leading-tight ml-2">
              <span class="text-xs font-medium" [style.color]="'var(--text-primary)'">John Doe</span>
              <span class="text-[10px]" [style.color]="'var(--text-ghost)'">Admin</span>
            </div>
          </div>
          <p-menu #menu [model]="userMenuItems" [popup]="true" appendTo="body"></p-menu>
          <button (click)="collapsed.set(!collapsed())" class="nav-item w-full text-left hidden md:flex mt-1">
            <i class="nav-icon pi" [class.pi-angle-double-right]="collapsed()" [class.pi-angle-double-left]="!collapsed()"></i>
            <span class="nav-label text-xs">Collapse</span>
          </button>
        </div>
      </aside>

      <div class="main-scroll-area">
        <header class="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b backdrop-blur-sm" [style.background]="'color-mix(in srgb, var(--bg-panel) 85%, transparent)'" [style.borderColor]="'var(--border-default)'" style="min-height: 61px;">
          <button class="md:hidden p-2" (click)="mobileOpen.set(true)"><i class="pi pi-bars"></i></button>
          <div class="flex-1"><ng-content select="[header]"></ng-content></div>
          <div class="flex items-center gap-2"><ng-content select="[header-actions]"></ng-content></div>
        </header>

        <main class="flex-1 p-5 max-w-400 w-full mx-auto">
          <ng-content select="[main-content]"></ng-content>
          <ng-content select="[bottom-main-content]"></ng-content>
        </main>

        <footer class="px-6 py-3 border-t text-[11px]" [style.color]="'var(--text-ghost)'" [style.borderColor]="'var(--border-default)'">
          <span>AdminHQ &copy; {{ currentYear }}</span>
        </footer>
      </div>
    </div>
  `
})
export class DashboardShellComponent {
  collapsed = signal(false);
  mobileOpen = signal(false);
  isDark = signal(false);
  currentYear = new Date().getFullYear();
  authStore = inject(AuthStore);

  navGroups = signal<NavGroup[]>([
    { group: 'Overview', items: [{ label: 'Dashboard', icon: 'pi pi-chart-pie', route: '/dashboard' }, { label: 'Finance', icon: 'pi pi-dollar', route: '/finances-overview' }, { label: 'Education', icon: 'pi pi-book', route: '/courses-overview' }] },
    { group: 'Manage', items: [{ label: 'Students', icon: 'pi pi-users', route: '/students' }, { label: 'Courses', icon: 'pi pi-book', route: '/courses' }, { label: 'Enrollments', icon: 'pi pi-file', route: '/enrollments' }, { label: 'Invoices', icon: 'pi pi-receipt', route: '/invoices' }, { label: 'Payments', icon: 'pi pi-money-bill', route: '/payments' }] },
    { group: 'System', items: [{ label: 'Logs', icon: 'pi-list', route: '/logs' }, { label: 'Settings', icon: 'pi-cog', route: '/settings' }] }
  ]);

  userMenuItems: MenuItem[] = [
    { label: 'View Profile', icon: 'pi pi-user', routerLink: '/profile' },
    { separator: true },
    { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.authStore.logout() }
  ];

  toggleDark() {
    this.isDark.update((v) => !v);
    document.documentElement.classList.toggle('dark', this.isDark());
  }
}
