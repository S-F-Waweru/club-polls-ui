import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { Tag } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { EnrollmentsStore } from '../../../state/ennrollment.store';

@Component({
  selector: 'app-enrollment-detail',
  standalone: true,
  imports: [
    DashboardShellComponent,
    Tag,
    CommonModule,
    Button,
    RouterLink,
    Tabs,
    TabPanel,
    TabList,
    Tab,
    TabPanels,
  ],
  templateUrl: './enrollment-detail.html',
  styleUrl: './enrollment-detail.css',
})
export class EnrollmentDetailComponent {
  private route = inject(ActivatedRoute);
  private store = inject(EnrollmentsStore);

  private enrollmentId = this.route.snapshot.paramMap.get('id');

  enrollment = computed(
    () => this.store.entities().find((e) => e.id === this.enrollmentId) ?? null,
  );

  constructor() {
    if (this.enrollmentId) {
      this.store.loadEnrollmentById(this.enrollmentId);
    }
  }

  enrollmentSeverity(status: string): 'success' | 'danger' | 'info' | 'warn' | 'secondary' {
    const map: Record<string, any> = {
      ACTIVE: 'success',
      COMPLETED: 'info',
      DROPPED: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  invoiceSeverity(status: string): 'success' | 'danger' | 'warn' | 'secondary' {
    const map: Record<string, any> = {
      PAID: 'success',
      PARTIAL: 'warn',
      UNPAID: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  studentStatusSeverity(status: string): 'success' | 'danger' | 'info' | 'secondary' {
    const map: Record<string, any> = {
      ACTIVE: 'success',
      GRADUATED: 'info',
      WITHDRAWN: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  avatarBg(name: string): string {
    const colors = [
      '#6366f1',
      '#22c55e',
      '#f59e0b',
      '#3b82f6',
      '#ec4899',
      '#14b8a6',
      '#8b5cf6',
      '#f97316',
    ];
    return colors[name.charCodeAt(0) % colors.length];
  }
}
