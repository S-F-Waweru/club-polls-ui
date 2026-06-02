import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { AnalyticsFilter, AnalyticsStore } from '../../../state/analytics.store';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dasboard-component',
  imports: [
    DashboardShellComponent,
    Button,
    TableModule,
    CommonModule,
    RouterLink,
    ChartModule,
    Select,
    InputText,
    FormsModule,
  ],
  templateUrl: './dasboard-component.html',
  styleUrl: './dasboard-component.css',
})
export class DashboardComponent implements OnInit {
  private store = inject(AnalyticsStore);

  filterMode = signal<'year' | 'range'>('year');
  selectedYear = signal<string>(new Date().getFullYear().toString());
  fromDate = signal<string>('');
  toDate = signal<string>('');

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
    this.store.loadFinancial(filter);
    this.store.loadInvoices(filter);
  }

  resetFilter() {
    this.selectedYear.set(new Date().getFullYear().toString());
    this.fromDate.set('');
    this.toDate.set('');
    this.store.setFilter({});
    this.store.loadDashboard();
    this.store.loadFinancial();
    this.store.loadInvoices();
  }

  isLoading = this.store.isLoading;
  dashboard = this.store.dashboard;
  financial = this.store.financial;

  ngOnInit() {
    this.store.loadDashboard();
    this.store.loadFinancial();
    this.store.loadInvoices();


  }

  metrics = computed(() => {
    const d = this.dashboard();
    const f = this.financial();
    return [
      {
        label: 'Active Students',
        value: d ? `${d.students.active}` : '—',
        sub: d ? `${d.students.total} total` : '',
        icon: 'pi pi-users',
        color: 'var(--p-primary-500)',
      },
      {
        label: 'Revenue Collected',
        value: d ? `KES ${d.finance.totalRevenue.toLocaleString()}` : '—',
        sub: f ? `${f.summary.collectionRate}% collection rate` : '',
        icon: 'pi pi-wallet',
        color: 'var(--p-green-500)',
      },
      {
        label: 'Outstanding Balance',
        value: d ? `KES ${d.finance.outstandingBalance.toLocaleString()}` : '—',
        sub: d ? `${d.finance.unpaidInvoices} unpaid invoices` : '',
        icon: 'pi pi-exclamation-circle',
        color: 'var(--p-amber-500)',
      },
      {
        label: 'Pending Payments',
        value: d ? `${d.finance.pendingPayments}` : '—',
        sub: 'Awaiting verification',
        icon: 'pi pi-clock',
        color: 'var(--p-red-500)',
      },
      {
        label: 'Total Enrollments',
        value: d ? `${d.enrollments.total}` : '—',
        sub: d ? `${d.courses.active} active courses` : '',
        icon: 'pi pi-book',
        color: 'var(--p-purple-500)',
      },
    ];
  });

  topDebtors = computed(() => this.store.invoices()?.topUnpaid ?? []);
  methodBreakdown = computed(() => this.store.financial()?.methodBreakdown ?? []);

  // ── Chart 1: Revenue Trend (Line) ──────────────────────────
  revenueChartData = computed(() => {
    const months = this.store.financial()?.revenueByMonth ?? [];
    return {
      labels: months.map((m) => m.month),
      datasets: [
        {
          label: 'Revenue (KES)',
          data: months.map((m) => Number(m.revenue)),
          fill: true,
          tension: 0.4,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.1)',
          pointBackgroundColor: '#6366f1',
          pointRadius: 4,
        },
      ],
    };
  });

  revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` KES ${Number(ctx.raw).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { size: 10 } },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        ticks: {
          color: '#94a3b8',
          font: { size: 10 },
          callback: (v: any) => `KES ${Number(v).toLocaleString()}`,
        },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    },
  };

  // ── Chart 2: Invoice Status (Donut) ────────────────────────
  invoiceDonutData = computed(() => {
    const breakdown = this.store.financial()?.invoiceBreakdown ?? [];
    const colorMap: Record<string, string> = {
      PAID: '#22c55e',
      PARTIAL: '#f59e0b',
      UNPAID: '#ef4444',
    };
    return {
      labels: breakdown.map((b) => b.status),
      datasets: [
        {
          data: breakdown.map((b) => Number(b.count)),
          backgroundColor: breakdown.map((b) => colorMap[b.status] ?? '#6366f1'),
          borderWidth: 0,
        },
      ],
    };
  });

  invoiceDonutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', font: { size: 10 }, padding: 12 },
      },
    },
  };

  // ── Chart 3: Payment Methods (Bar) ─────────────────────────
  methodBarData = computed(() => {
    const methods = this.store.financial()?.methodBreakdown ?? [];
    const colorMap: Record<string, string> = {
      MPESA: '#22c55e',
      BANK: '#3b82f6',
      CASH: '#f59e0b',
    };
    return {
      labels: methods.map((m) => m.method),
      datasets: [
        {
          label: 'Amount (KES)',
          data: methods.map((m) => Number(m.total)),
          backgroundColor: methods.map((m) => colorMap[m.method] ?? '#6366f1'),
          borderRadius: 6,
        },
      ],
    };
  });

  methodBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` KES ${Number(ctx.raw).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { size: 11 } },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: '#94a3b8',
          font: { size: 10 },
          callback: (v: any) => `KES ${Number(v).toLocaleString()}`,
        },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    },
  };

  methodIcon(method: string) {
    return (
      { MPESA: 'pi pi-mobile', BANK: 'pi pi-building-columns', CASH: 'pi pi-wallet' }[method] ??
      'pi pi-credit-card'
    );
  }

  methodColor(method: string) {
    return { MPESA: '#22c55e', BANK: '#3b82f6', CASH: '#f59e0b' }[method] ?? 'var(--text-muted)';
  }

  invoiceSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    return ({ PAID: 'success', PARTIAL: 'warn', UNPAID: 'danger' } as any)[status] ?? 'secondary';
  }
}
