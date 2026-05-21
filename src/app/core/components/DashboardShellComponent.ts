import { Component, signal, computed, inject } from '@angular/core';
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
  imports: [CommonModule, RouterModule, Menu, PrimeTemplate],
  styles: [
    `
      :host {
        display: block;
      }

      /* ─── Sidebar ─── */
      .sidebar {
        width: 240px;
        min-width: 240px;
        transition:
          width 0.25s cubic-bezier(0.4, 0, 0.2, 1),
          min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: width;
      }
      .sidebar.collapsed {
        width: 64px;
        min-width: 64px;
      }

      /* Label / badge fade when collapsed */
      .sidebar.collapsed .nav-label,
      .sidebar.collapsed .nav-badge,
      .sidebar.collapsed .nav-group-label,
      .sidebar.collapsed .logo-text,
      .sidebar.collapsed .sidebar-footer-text {
        opacity: 0;
        pointer-events: none;
        width: 0;
        overflow: hidden;
      }

      .nav-label,
      .nav-badge,
      .nav-group-label,
      .logo-text,
      .sidebar-footer-text {
        transition:
          opacity 0.2s ease,
          width 0.25s ease;
        white-space: nowrap;
      }

      /* Nav item */
      .nav-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border-radius: var(--radius-sm);
        cursor: pointer;
        color: var(--text-muted);
        font-size: 0.825rem;
        font-weight: 500;
        transition:
          background 0.15s,
          color 0.15s;
        text-decoration: none;
        position: relative;
      }
      .nav-item:hover {
        background: var(--bg-subtle);
        color: var(--text-primary);
      }
      .nav-item.active {
        background: color-mix(in srgb, var(--primary-500) 10%, transparent);
        color: var(--primary-600);
      }
      .dark .nav-item.active {
        background: color-mix(in srgb, var(--primary-500) 15%, transparent);
        color: var(--primary-400);
      }
      .nav-item .nav-icon {
        font-size: 1rem;
        flex-shrink: 0;
        width: 20px;
        text-align: center;
      }

      /* Active indicator bar */
      .nav-item.active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 20%;
        height: 60%;
        width: 3px;
        border-radius: 0 2px 2px 0;
        background: var(--primary-500);
      }

      /* Tooltip for collapsed sidebar */
      .sidebar.collapsed .nav-item {
        justify-content: center;
        padding: 10px;
      }
      .sidebar.collapsed .nav-item:hover::after {
        content: attr(data-label);
        position: absolute;
        left: calc(100% + 10px);
        top: 50%;
        transform: translateY(-50%);
        background: var(--bg-panel);
        border: 1px solid var(--border-default);
        color: var(--text-primary);
        font-size: 0.75rem;
        padding: 4px 10px;
        border-radius: var(--radius-sm);
        white-space: nowrap;
        box-shadow: var(--shadow-lg);
        z-index: 100;
        pointer-events: none;
      }

      /* Scrollbar */
      .sidebar-nav::-webkit-scrollbar {
        width: 3px;
      }
      .sidebar-nav::-webkit-scrollbar-track {
        background: transparent;
      }
      .sidebar-nav::-webkit-scrollbar-thumb {
        background: var(--border-muted);
        border-radius: 99px;
      }

      /* Grid overlay */
      .grid-overlay {
        background-image:
          linear-gradient(var(--grid-line) 1px, transparent 1px),
          linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
        background-size: 40px 40px;
      }

      /* Mobile overlay */
      .mobile-overlay {
        display: none;
      }
      @media (max-width: 768px) {
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 50;
          transform: translateX(-100%);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sidebar.mobile-open {
          transform: translateX(0);
          width: 240px !important;
          min-width: 240px !important;
        }
        .sidebar.mobile-open .nav-label,
        .sidebar.mobile-open .nav-badge,
        .sidebar.mobile-open .nav-group-label,
        .sidebar.mobile-open .logo-text {
          opacity: 1;
          width: auto;
        }
        .mobile-overlay {
          display: block;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 49;
          backdrop-filter: blur(2px);
        }
      }
    `,
  ],
  template: `
    <div
      class="min-h-screen w-full relative overflow-x-hidden font-sans"
      [style.background]="'var(--bg-app)'"
      [style.color]="'var(--text-primary)'"
    >
      <!-- Grid Overlay -->
      <div class="absolute inset-0 pointer-events-none opacity-60 grid-overlay"></div>

      <!-- Mobile Overlay -->
      @if (mobileOpen()) {
        <div class="mobile-overlay" (click)="mobileOpen.set(false)"></div>
      }

      <!-- Root Layout: Sidebar + Main -->
      <div class="relative z-10 flex min-h-screen">
        <!-- ═══════════════════════════════════════
             SIDEBAR
        ═══════════════════════════════════════ -->
        <aside
          class="sidebar flex flex-col h-screen sticky top-0"
          [class.collapsed]="collapsed()"
          [class.mobile-open]="mobileOpen()"
          [style.background]="'var(--bg-panel)'"
          [style.borderRight]="'1px solid var(--border-default)'"
          [style.boxShadow]="'var(--shadow-sm)'"
        >
          <!-- Logo -->
          <div
            class="flex items-center gap-3 px-4 py-4"
            [style.borderBottom]="'1px solid var(--border-default)'"
            [style.minHeight]="'61px'"
          >
            <div
              class="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center"
              [style.background]="'var(--primary-600)'"
              [style.color]="'#fff'"
              [style.fontSize]="'1rem'"
            >
              <i class="pi pi-bolt"></i>
            </div>
            <span
              class="logo-text font-semibold text-sm tracking-tight"
              [style.color]="'var(--text-primary)'"
            >
              AdminHQ
            </span>
          </div>

          <!-- Nav -->
          <nav class="sidebar-nav flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-1">
            @for (group of navGroups(); track group.group) {
              <div class="mb-1">
                <p
                  class="nav-group-label px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest"
                  [style.color]="'var(--text-ghost)'"
                >
                  {{ group.group }}
                </p>
                @for (item of group.items; track item.route) {
                  <a
                    [routerLink]="item.route"
                    routerLinkActive="active"
                    class="nav-item"
                    [attr.data-label]="item.label"
                  >
                    <i class="nav-icon pi {{ item.icon }}"></i>
                    <span class="nav-label flex-1">{{ item.label }}</span>
                    @if (item.badge) {
                      <span
                        class="nav-badge text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                        [style.background]="'color-mix(in srgb, var(--primary-500) 15%, transparent)'"
                        [style.color]="'var(--primary-600)'"
                      >
                        {{ item.badge }}
                      </span>
                    }
                  </a>
                }
              </div>
            }
          </nav>

          <!-- Footer -->
          <div
            class="px-2 py-3 flex flex-col gap-1"
            [style.borderTop]="'1px solid var(--border-default)'"
          >
            <!-- User avatar row --><!-- Added (click)="menu.toggle($event)" and cursor-pointer -->
            <div class="nav-item cursor-pointer" (click)="menu.toggle($event)">
              <div
                class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                [style.background]="'var(--primary-600)'"
                [style.color]="'#fff'"
              >
                JD
              </div>
              <div class="nav-label flex flex-col leading-tight">
                <span class="text-xs font-medium" [style.color]="'var(--text-primary)'"
                  >John Doe</span
                >
                <span class="text-[10px]" [style.color]="'var(--text-ghost)'">Admin</span>
              </div>
            </div>

            <!-- The Dropdown Menu containing your actions -->
            <p-menu #menu [model]="userMenuItems" [popup]="true" appendTo="body">
              <ng-template pTemplate="item" let-item>
                @if (item.routerLink) {
                  <!-- Anchor tag for regular navigation (Profile) -->
                  <a
                    [routerLink]="item.routerLink"
                    class="flex items-center p-menuitem-link gap-2 px-3 py-2"
                  >
                    <span [class]="item.icon"></span>
                    <span class="text-sm">{{ item.label }}</span>
                  </a>
                } @else {
                  <!-- Anchor tag for click handlers (Logout) -->
                  <a
                    href="javascript:void(0)"
                    (click)="item.command()"
                    class="flex items-center p-menuitem-link gap-2 px-3 py-2 text-red-500"
                  >
                    <span [class]="item.icon"></span>
                    <span class="text-sm font-medium">{{ item.label }}</span>
                  </a>
                }
              </ng-template>
            </p-menu>

            <!-- Collapse toggle -->
            <button
              (click)="collapsed.set(!collapsed())"
              class="nav-item w-full text-left hidden md:flex"
              [attr.data-label]="collapsed() ? 'Expand' : 'Collapse'"
            >
              <i
                class="nav-icon pi"
                [class.pi-angle-double-right]="collapsed()"
                [class.pi-angle-double-left]="!collapsed()"
              ></i>
              <span class="nav-label text-xs">Collapse</span>
            </button>
          </div>
        </aside>

        <!-- ═══════════════════════════════════════
             MAIN AREA
        ═══════════════════════════════════════ -->
        <div class="flex-1 flex flex-col min-w-0">
          <!-- ── HEADER ── -->
          <header
            class="sticky top-0 z-30 flex items-center justify-between px-6 py-3 gap-4"
            [style.background]="'color-mix(in srgb, var(--bg-panel) 85%, transparent)'"
            [style.borderBottom]="'1px solid var(--border-default)'"
            [style.backdropFilter]="'blur(12px)'"
            [style.minHeight]="'61px'"
          >
            <!-- Mobile hamburger -->
            <button
              class="md:hidden p-2 rounded-md"
              [style.color]="'var(--text-muted)'"
              (click)="mobileOpen.set(true)"
            >
              <i class="pi pi-bars text-base"></i>
            </button>

            <!-- Breadcrumb / page title slot -->
            <div class="flex-1 min-w-0">
              <ng-content select="[header]"></ng-content>
            </div>

            <!-- Right actions slot -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <ng-content select="[header-actions]"></ng-content>

              <!-- Default notification bell -->
              <button
                class="relative w-9 h-9 rounded-md flex items-center justify-center transition-colors"
                [style.color]="'var(--text-muted)'"
                [style.border]="'1px solid var(--border-default)'"
              >
                <i class="pi pi-bell text-sm"></i>
                <span
                  class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  [style.background]="'var(--danger)'"
                >
                </span>
              </button>

              <!-- Dark mode toggle -->
              <button
                (click)="toggleDark()"
                class="w-9 h-9 rounded-md flex items-center justify-center transition-colors"
                [style.color]="'var(--text-muted)'"
                [style.border]="'1px solid var(--border-default)'"
              >
                <i class="pi text-sm" [class.pi-moon]="!isDark()" [class.pi-sun]="isDark()"></i>
              </button>
            </div>
          </header>

          <!-- ── CONTENT GRID ── -->
          <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 max-w-400 w-full mx-auto">
            <!-- Left Column (8 cols total) -->
            <main class="col-span-12 lg:col-span-9 flex flex-col gap-5 min-w-0">
              <!-- Top Main Content -->
              <ng-content select="[main-content]"></ng-content>

              <!-- Bottom Main Content sits right underneath it seamlessly -->
              <ng-content select="[bottom-main-content]"></ng-content>
            </main>

            <!-- Right Side Panel Column (4 cols) -->
            <aside class="col-span-12 lg:col-span-3 flex flex-col gap-5 min-w-0">
              <ng-content select="[side-panel]"></ng-content>
            </aside>
          </div>

          <!-- ── FOOTER ── -->
          <footer
            class="px-6 py-3 flex items-center justify-between text-[11px]"
            [style.color]="'var(--text-ghost)'"
            [style.borderTop]="'1px solid var(--border-default)'"
          >
            <span>AdminHQ &copy; {{ currentYear }}</span>
            <ng-content select="[footer]"></ng-content>
            <span>v1.0.0</span>
          </footer>
        </div>
      </div>
    </div>
  `,
})
export class DashboardShellComponent {
  collapsed = signal(false);
  mobileOpen = signal(false);
  isDark = signal(false);

  currentYear = new Date().getFullYear();

  navGroups = signal<NavGroup[]>([
    {
      group: 'Overview',
      items: [
        { label: 'Dashboard', icon: 'pi-chart-pie', route: '/dashboard' },
        { label: 'Enrollments', icon: 'pi-note', route: '/analytics' },
      ],
    },
    {
      group: 'Manage',
      items: [
        { label: 'Students', icon: 'pi-users', route: '/students', badge: 4 },
        { label: 'Courses', icon: 'pi-book', route: '/cources', badge: 12 },
        { label: 'Products', icon: 'pi-box', route: '/products' },
        { label: 'Inventory', icon: 'pi-warehouse', route: '/inventory' },
      ],
    },
    {
      group: 'System',
      items: [
        { label: 'Logs', icon: 'pi-list', route: '/logs' },
        { label: 'Settings', icon: 'pi-cog', route: '/settings' },
      ],
    },
  ]);
  userMenuItems: MenuItem[] = [
    {
      label: 'View Profile',
      icon: 'pi pi-user',
      routerLink: '/profile', // Updates URL without reloading
    },
    {
      separator: true, // Adds a clean divider line
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => {
        this.handleLogout();
      },
    },
  ];

  authStore = inject(AuthStore)
  handleLogout() {
    console.log('Logging user out...');
    // Clear your auth tokens / redirect to login page here
    this.authStore.logout()
  }

  toggleDark() {
    this.isDark.update((v) => !v);
    document.documentElement.classList.toggle('dark', this.isDark());
  }
}
