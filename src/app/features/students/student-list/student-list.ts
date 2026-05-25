import { Component, computed, inject, signal } from '@angular/core';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Student, StudentsStore } from '../../../state/student.store';
import { DatePipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';


@Component({
  selector: 'app-student-list',
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
  ],
  templateUrl: './student-list.html',
  styleUrl: './student-list.css',
})
export class StudentListComponent {
  search = '';
  activeFilter = signal('All');
  filters = ['All', 'ACTIVE', 'GRADUATED', 'WITHDRAWN'];

  studentStore = inject(StudentsStore);

  students = this.studentStore.entities;
  isLoading = this.studentStore.isLoading;
  total = this.studentStore.totalRecords;

  filtered = computed(() => {
    let list = this.students();
    if (this.activeFilter() !== 'All') {
      list = list.filter((s) => s.status === this.activeFilter());
    }
    const q = this.search.toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q),
      );
    }
    return list;
  });

  recent = computed(() => this.students().slice(0, 4));

  stats = computed(() => {
    const all = this.students();
    const active = all.filter((s) => s.status === 'ACTIVE').length;
    const graduated = all.filter((s) => s.status === 'GRADUATED').length;
    const withdrawn = all.filter((s) => s.status === 'WITHDRAWN').length;
    return [
      {
        label: 'Total Enrolled',
        value: all.length,
        sub: 'All programmes',
        color: 'var(--text-muted)',
      },
      { label: 'Active', value: active, sub: 'Currently enrolled', color: 'var(--success)' },
      { label: 'Graduated', value: graduated, sub: 'Completed', color: 'var(--info)' },
      { label: 'Withdrawn', value: withdrawn, sub: 'No longer active', color: 'var(--danger)' },
    ];
  });

  statusSeverity(status: string): 'success' | 'danger' | 'info' | 'warn' | 'secondary' {
    const map: Record<string, 'success' | 'danger' | 'info' | 'warn' | 'secondary'> = {
      ACTIVE: 'success',
      WITHDRAWN: 'danger',
      GRADUATED: 'info',
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

  private confirm = inject(ConfirmationService);

  confirmDelete(s: Student) {
    this.confirm.confirm({
      message: `Are you sure you want to delete ${s.fullName}?`,
      header: 'Delete Student',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.studentStore.deleteStudent(s.id),
    });
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
    const i = name.charCodeAt(0) % colors.length;
    return colors[i];
  }
}
