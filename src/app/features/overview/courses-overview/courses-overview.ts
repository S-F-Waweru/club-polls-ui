import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AnalyticsFilter, AnalyticsStore } from '../../../state/analytics.store';
import { Button } from 'primeng/button';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-courses-overview',
  imports: [
    Button,
    DashboardShellComponent,
    InputText,
    Select,
    FormsModule,
    ChartModule,
    CommonModule,
    RouterLink,
  ],
  templateUrl: './courses-overview.html',
  styleUrl: './courses-overview.css',
})
export class CoursesOverview implements OnInit {
  private store = inject(AnalyticsStore);

  filterMode = signal<'year' | 'range'>('year');
  selectedYear = signal<string>(new Date().getFullYear().toString());
  fromDate = signal<string>('');
  toDate = signal<string>('');

  isLoading = this.store.isLoading;
  courses = this.store.courses;
  students = this.store.students;
  dashboard = this.store.dashboard;

  yearOptions = ['2024', '2025', '2026'].map((y) => ({ label: y, value: y }));

  applyFilter() {
    let filter: AnalyticsFilter = {};
    if (this.filterMode() === 'year') {
      filter = { year: this.selectedYear() };
    } else {
      filter = { from: this.fromDate(), to: this.toDate() };
    }
    this.store.setFilter(filter);
    this.store.loadDashboard(filter);
    this.store.loadCourses(filter);
    this.store.loadStudents(filter);
  }

  resetFilter() {
    this.selectedYear.set(new Date().getFullYear().toString());
    this.fromDate.set('');
    this.toDate.set('');
    this.store.setFilter({});
    this.store.loadDashboard();
    this.store.loadCourses();
    this.store.loadStudents();
  }

  ngOnInit() {
    this.store.loadDashboard();
    this.store.loadCourses();
    this.store.loadStudents();
  }

  // ── Metric Cards ──────────────────────────────────────────
  metrics = computed(() => {
    const d = this.dashboard();
    return [
      {
        label: 'Total Students',
        value: d ? `${d.students.total}` : '—',
        sub: d ? `${d.students.active} active` : '',
        icon: 'pi pi-users',
        color: 'var(--p-primary-500)',
      },
      {
        label: 'Active Students',
        value: d ? `${d.students.active}` : '—',
        sub: 'Currently enrolled',
        icon: 'pi pi-user-plus',
        color: 'var(--p-green-500)',
      },
      {
        label: 'Total Courses',
        value: d ? `${d.courses.total}` : '—',
        sub: d ? `${d.courses.active} active` : '',
        icon: 'pi pi-book',
        color: 'var(--p-blue-500)',
      },
      {
        label: 'Total Enrollments',
        value: d ? `${d.enrollments.total}` : '—',
        sub: 'Across all courses',
        icon: 'pi pi-address-book',
        color: 'var(--p-purple-500)',
      },
    ];
  });

  // ── Chart: Enrollments per Month (Line) ──────────────────
  enrollmentsPerMonthData = computed(() => {
    const months = this.courses()?.enrollmentsPerMonth ?? [];
    return {
      labels: months.map((m) => m.month),
      datasets: [
        {
          label: 'Enrollments',
          data: months.map((m) => Number(m.count)),
          fill: true,
          tension: 0.4,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.08)',
          pointBackgroundColor: '#6366f1',
          pointRadius: 4,
        },
      ],
    };
  });

  enrollmentsLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} enrollments` } },
    },
    scales: {
      x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  };

  // ── Chart: New Students per Month (Bar) ──────────────────
  newStudentsData = computed(() => {
    const months = this.students()?.newPerMonth ?? [];
    return {
      labels: months.map((m) => m.month),
      datasets: [
        {
          label: 'New Students',
          data: months.map((m) => Number(m.count)),
          backgroundColor: 'rgba(34,197,94,0.7)',
          borderRadius: 6,
        },
      ],
    };
  });

  newStudentsBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} students` } },
    },
    scales: {
      x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
      y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  };

  // ── Chart: Student Status Donut ───────────────────────────
  studentStatusData = computed(() => {
    const breakdown = this.students()?.statusBreakdown ?? [];
    const colors = ['#22c55e', '#6366f1', '#f59e0b', '#ef4444', '#94a3b8'];
    return {
      labels: breakdown.map((b) => b.status),
      datasets: [
        {
          data: breakdown.map((b) => Number(b.count)),
          backgroundColor: breakdown.map((_, i) => colors[i % colors.length]),
          borderWidth: 0,
        },
      ],
    };
  });

  studentStatusDonutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 }, padding: 12 } },
    },
  };

  // ── Chart: Course Enrollment Capacity (Horizontal Bar) ───
  courseCapacityData = computed(() => {
    const courses = this.courses()?.enrollmentPerCourse ?? [];
    return {
      labels: courses.map((c) => c.code),
      datasets: [
        {
          label: 'Enrolled',
          data: courses.map((c) => Number(c.enrolled)),
          backgroundColor: 'rgba(99,102,241,0.7)',
          borderRadius: 4,
        },
        {
          label: 'Capacity',
          data: courses.map((c) => c.maxCapacity),
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: 4,
        },
      ],
    };
  });

  courseCapacityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#94a3b8', font: { size: 10 }, padding: 10 },
      },
    },
    scales: {
      x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
    },
  };

  // ── Derived data ──────────────────────────────────────────
  enrollmentPerCourse = computed(() => this.courses()?.enrollmentPerCourse ?? []);
  revenuePerCourse = computed(() => this.courses()?.revenuePerCourse ?? []);
  debtors = computed(() => this.students()?.debtors ?? []);
  studentStatusBreakdown = computed(() => this.students()?.statusBreakdown ?? []);

  // ── Capacity fill % ───────────────────────────────────────
  capacityPercent(enrolled: string, max: number): number {
    return max > 0 ? Math.min(100, Math.round((Number(enrolled) / max) * 100)) : 0;
  }

  capacityColor(pct: number): string {
    if (pct >= 90) return '#ef4444';
    if (pct >= 70) return '#f59e0b';
    return '#22c55e';
  }
}
