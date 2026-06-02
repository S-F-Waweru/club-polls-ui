import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AnalyticsFilter, AnalyticsStore } from '../../../state/analytics.store';
import { Button } from 'primeng/button';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-financial-overview',
  imports: [
    Button,
    DashboardShellComponent,
    InputText,
    Select,
    FormsModule,
    ChartModule,
    TableModule,
    Tag,
    CommonModule,
    RouterLink,
  ],
  templateUrl: './financial-overview.html',
  styleUrl: './financial-overview.css',
})
export class FinancialOverview implements OnInit {
  private store = inject(AnalyticsStore);

  filterMode = signal<'year' | 'range'>('year');
  selectedYear = signal<string>(new Date().getFullYear().toString());
  fromDate = signal<string>('');
  toDate = signal<string>('');

  isLoading = this.store.isLoading;
  financial = this.store.financial;
  dashboard = this.store.dashboard;
  invoices = this.store.invoices;
  payments = this.store.payments;

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
    this.store.loadPayments(filter);
  }

  resetFilter() {
    this.selectedYear.set(new Date().getFullYear().toString());
    this.fromDate.set('');
    this.toDate.set('');
    this.store.setFilter({});
    this.store.loadDashboard();
    this.store.loadFinancial();
    this.store.loadInvoices();
    this.store.loadPayments();
  }

  ngOnInit() {
    this.store.loadDashboard();
    this.store.loadFinancial();
    this.store.loadInvoices();
    this.store.loadPayments();
  }

  // ── Metric Cards ──────────────────────────────────────────
  metrics = computed(() => {
    const d = this.dashboard();
    const f = this.financial();
    return [
      {
        label: 'Revenue Collected',
        value: d ? `KES ${d.finance.totalRevenue.toLocaleString()}` : '—',
        sub: f ? `${f.summary.collectionRate}% collection rate` : '',
        icon: 'pi pi-wallet',
        color: 'var(--p-green-500)',
      },
      {
        label: 'Total Billed',
        value: f ? `KES ${f.summary.billed.toLocaleString()}` : '—',
        sub: f ? `KES ${f.summary.outstanding.toLocaleString()} outstanding` : '',
        icon: 'pi pi-file-edit',
        color: 'var(--p-blue-500)',
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
        label: 'Collection Rate',
        value: f ? `${f.summary.collectionRate}%` : '—',
        sub: 'of total billed',
        icon: 'pi pi-chart-bar',
        color: 'var(--p-purple-500)',
      },
    ];
  });

  // ── Chart: Revenue by Month (Line) ───────────────────────
  revenueChartData = computed(() => {
    const months = this.financial()?.revenueByMonth ?? [];
    return {
      labels: months.map((m) => m.month),
      datasets: [
        {
          label: 'Revenue (KES)',
          data: months.map((m) => Number(m.revenue)),
          fill: true,
          tension: 0.4,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.08)',
          pointBackgroundColor: '#22c55e',
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
      tooltip: { callbacks: { label: (ctx: any) => ` KES ${Number(ctx.raw).toLocaleString()}` } },
    },
    scales: {
      x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: {
        ticks: { color: '#94a3b8', font: { size: 10 }, callback: (v: any) => `KES ${Number(v).toLocaleString()}` },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    },
  };

  // ── Chart: Payments per Month (Bar) ──────────────────────
  paymentsPerMonthData = computed(() => {
    const months = this.payments()?.paymentsPerMonth ?? [];
    return {
      labels: months.map((m) => m.month),
      datasets: [
        {
          label: 'Amount (KES)',
          data: months.map((m) => Number(m.total)),
          backgroundColor: 'rgba(99,102,241,0.7)',
          borderRadius: 6,
        },
      ],
    };
  });

  paymentsBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => ` KES ${Number(ctx.raw).toLocaleString()}` } },
    },
    scales: {
      x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
      y: {
        ticks: { color: '#94a3b8', font: { size: 10 }, callback: (v: any) => `KES ${Number(v).toLocaleString()}` },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    },
  };

  // ── Chart: Invoice Status Donut ───────────────────────────
  invoiceDonutData = computed(() => {
    const breakdown = this.financial()?.invoiceBreakdown ?? [];
    const colorMap: Record<string, string> = { PAID: '#22c55e', PARTIAL: '#f59e0b', UNPAID: '#ef4444' };
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
      legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 }, padding: 12 } },
    },
  };

  // ── Chart: Payment Method Donut ───────────────────────────
  methodDonutData = computed(() => {
    const methods = this.financial()?.methodBreakdown ?? [];
    const colorMap: Record<string, string> = { MPESA: '#22c55e', BANK: '#3b82f6', CASH: '#f59e0b' };
    return {
      labels: methods.map((m) => m.method),
      datasets: [
        {
          data: methods.map((m) => Number(m.total)),
          backgroundColor: methods.map((m) => colorMap[m.method] ?? '#6366f1'),
          borderWidth: 0,
        },
      ],
    };
  });

  methodDonutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 }, padding: 12 } },
      tooltip: { callbacks: { label: (ctx: any) => ` KES ${Number(ctx.raw).toLocaleString()}` } },
    },
  };

  // ── Payment Status Breakdown ──────────────────────────────
  paymentStatusBreakdown = computed(() => this.payments()?.statusBreakdown ?? []);

  paymentStatusColor(status: string) {
    return { VERIFIED: '#22c55e', PENDING: '#f59e0b', REJECTED: '#ef4444' }[status] ?? '#94a3b8';
  }

  paymentStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    return ({ VERIFIED: 'success', PENDING: 'warn', REJECTED: 'danger' } as any)[status] ?? 'secondary';
  }

  // ── Top Unpaid Invoices ───────────────────────────────────
  topUnpaid = computed(() => this.invoices()?.topUnpaid ?? []);

  // ── Invoice Status Breakdown ──────────────────────────────
  invoiceStatusBreakdown = computed(() => this.invoices()?.statusBreakdown ?? []);

  invoiceSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    return ({ PAID: 'success', PARTIAL: 'warn', UNPAID: 'danger' } as any)[status] ?? 'secondary';
  }

  // ── Method helpers ────────────────────────────────────────
  methodIcon(method: string) {
    return (
      { MPESA: 'pi pi-mobile', BANK: 'pi pi-building-columns', CASH: 'pi pi-wallet' }[method] ??
      'pi pi-credit-card'
    );
  }

  methodColor(method: string) {
    return { MPESA: '#22c55e', BANK: '#3b82f6', CASH: '#f59e0b' }[method] ?? 'var(--text-muted)';
  }
}
