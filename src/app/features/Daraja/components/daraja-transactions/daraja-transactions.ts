import { Component, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { DashboardShellComponent } from '../../../../core/components/DashboardShellComponent';
import { DarajaStore } from '../../daraja.store';

@Component({
  selector: 'app-daraja-transactions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardShellComponent,
    Tag,
    Button,
    SkeletonModule,
    SelectModule,
    InputTextModule,
    DatePickerModule,
  ],
  templateUrl: './daraja-transactions.html',
})
export class DarajaTransactionsComponent implements OnInit, OnDestroy {
  protected store = inject(DarajaStore);

  private pollSub?: Subscription;
  private countdownSub?: Subscription;
  readonly POLL_INTERVAL = 15000;
  countdown = 15;

  // Filter bindings
  selectedStatus = '';
  selectedType = '';
  phoneSearch = '';
  accountRefSearch = '';
  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Failed', value: 'FAILED' },
  ];

  typeOptions = [
    { label: 'All Types', value: '' },
    { label: 'STK Push', value: 'STK_PUSH' },
    { label: 'C2B Paybill', value: 'C2B_PAYBILL' },
  ];

  summary = computed(() => {
    const txs = this.store.transactions();
    return {
      completed: txs.filter(t => t.status === 'COMPLETED').length,
      pending: txs.filter(t => t.status === 'PENDING').length,
      failed: txs.filter(t => t.status === 'FAILED').length,
      totalAmount: txs
        .filter(t => t.status === 'COMPLETED')
        .reduce((sum, t) => sum + Number(t.amount), 0),
    };
  });

  hasActiveFilters = computed(() => {
    const f = this.store.filters();
    return !!(f.status || f.type || f.phone || f.accountReference || f.from || f.to);
  });

  ngOnInit() {
    this.store.loadTransactions();
    this.startPolling();
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
    this.countdownSub?.unsubscribe();
  }

  private startPolling() {
    this.pollSub = interval(this.POLL_INTERVAL).subscribe(() => {
      if (this.store.pollingEnabled()) this.store.refresh();
    });
    this.countdownSub = interval(1000).subscribe(() => {
      if (this.store.pollingEnabled()) {
        this.countdown = this.countdown <= 1 ? 15 : this.countdown - 1;
      }
    });
  }

  applyFilters() {
    this.store.setFilters({
      status: this.selectedStatus,
      type: this.selectedType,
      phone: this.phoneSearch,
      accountReference: this.accountRefSearch,
      from: this.dateFrom ? this.dateFrom.toISOString() : '',
      to: this.dateTo ? this.dateTo.toISOString() : '',
    });
  }

  clearFilters() {
    this.selectedStatus = '';
    this.selectedType = '';
    this.phoneSearch = '';
    this.accountRefSearch = '';
    this.dateFrom = null;
    this.dateTo = null;
    this.store.clearFilters();
  }

  onPageChange(page: number) {
    this.store.setPage(page);
  }

  statusSeverity(status: string): any {
    return { COMPLETED: 'success', PENDING: 'warn', FAILED: 'danger' }[status] ?? 'secondary';
  }

  typeSeverity(type: string): any {
    return type === 'STK_PUSH' ? 'info' : 'secondary';
  }
}
