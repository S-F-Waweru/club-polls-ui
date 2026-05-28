import { Component, computed, inject, signal } from '@angular/core';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Enrollment, EnrollmentsStore } from '../../../state/ennrollment.store';

@Component({
  selector: 'app-enrollment-list',
  imports: [
    DashboardShellComponent,
    Button,
    InputText,
    FormsModule,
    TableModule,
    Tag,
    DatePipe,
    RouterLink,
    ConfirmDialog,
    DecimalPipe,
  ],
  templateUrl: './enrollment-list-component.html',
  styleUrl: './enrollment-list-component.css',
})
export class EnrollmentListComponent {
  search = '';
  activeFilter = signal('All');
  filters = ['All', 'ACTIVE', 'COMPLETED', 'DROPPED'];

  enrollmentStore = inject(EnrollmentsStore);
  private confirm = inject(ConfirmationService);

  enrollments = this.enrollmentStore.entities;
  isLoading = this.enrollmentStore.isLoading;
  total = this.enrollmentStore.totalRecords;

  filtered = computed(() => {
    let list = this.enrollments();
    if (this.activeFilter() !== 'All') {
      list = list.filter((e) => e.status === this.activeFilter());
    }
    const q = this.search.toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          e.student.fullName.toLowerCase().includes(q) ||
          e.student.studentId.toLowerCase().includes(q) ||
          e.course.name.toLowerCase().includes(q) ||
          e.course.code.toLowerCase().includes(q),
      );
    }
    return list;
  });

  recent = computed(() => this.enrollments().slice(0, 4));

  stats = computed(() => {
    const all = this.enrollments();
    const active = all.filter((e) => e.status === 'ACTIVE').length;
    const completed = all.filter((e) => e.status === 'COMPLETED').length;
    const dropped = all.filter((e) => e.status === 'DROPPED').length;
    const unpaid = all.filter((e) => e.invoice.status === 'UNPAID').length;
    return [
      {
        label: 'Total Enrollments',
        value: all.length,
        sub: 'All courses',
        color: 'var(--text-muted)',
      },
      { label: 'Active', value: active, sub: 'Currently enrolled', color: 'var(--success)' },
      { label: 'Completed', value: completed, sub: 'Finished course', color: 'var(--info)' },
      {
        label: 'Unpaid Invoices',
        value: unpaid,
        sub: 'Balance outstanding',
        color: 'var(--danger)',
      },
    ];
  });

  statusSeverity(status: string): 'success' | 'danger' | 'info' | 'warn' | 'secondary' {
    const map: Record<string, 'success' | 'danger' | 'info' | 'warn' | 'secondary'> = {
      ACTIVE: 'success',
      COMPLETED: 'info',
      DROPPED: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  invoiceSeverity(status: string): 'success' | 'danger' | 'warn' | 'secondary' {
    const map: Record<string, 'success' | 'danger' | 'warn' | 'secondary'> = {
      PAID: 'success',
      PARTIAL: 'warn',
      UNPAID: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  initials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  avatarBg(name: string) {
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

  confirmDelete(e: Enrollment) {
    this.confirm.confirm({
      message: `Remove ${e.student.fullName} from ${e.course.name}?`,
      header: 'Delete Enrollment',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.enrollmentStore.deleteEnrollment(e.id),
    });
  }
}
