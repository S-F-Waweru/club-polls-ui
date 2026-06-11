import { Component, OnInit, computed, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { FEE_TYPE_LABELS, Payment } from '../../../models/club.models';
import { AuthStore } from '../../../state/auth.store';
import { ElectionsStore } from '../../../state/elections.store';
import { FeeSettingsStore } from '../../../state/fee-settings.store';
import { MembersStore } from '../../../state/members.store';
import { PaymentsStore } from '../../../state/payment.store';

@Component({
  selector: 'app-dasboard-component',
  standalone: true,
  imports: [
    DashboardShellComponent,
    Button,
    TableModule,
    Tag,
    RouterLink,
    ChartModule,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './dasboard-component.html',
  styleUrl: './dasboard-component.css',
})
export class DashboardComponent implements OnInit {
  readonly auth = inject(AuthStore);
  readonly members = inject(MembersStore);
  readonly payments = inject(PaymentsStore);
  readonly fees = inject(FeeSettingsStore);
  readonly elections = inject(ElectionsStore);

  isAdmin = this.auth.isAdmin;
  currentUserName = computed(() => this.auth.currentUser()?.name ?? 'My account');

  ngOnInit() {
    this.fees.loadCurrent();
    this.elections.loadElections();
    this.elections.loadOpenElections();
    this.elections.loadHistory();

    if (this.auth.isAdmin()) {
      this.members.loadMembers();
      this.payments.loadPayments();
    } else {
      this.members.loadMyProfile();
      this.members.loadMyFinancialStatus();
      this.payments.loadMyPayments();
    }
  }

  metrics = computed(() => {
    const allPayments = this.payments.entities();
    const verified = allPayments.filter((payment) => payment.status === 'VERIFIED');
    const collected = verified.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const pending = allPayments.filter((payment) => payment.status === 'PENDING').length;

    if (!this.auth.isAdmin()) {
      const financial = this.members.myFinancialStatus();
      return [
        {
          label: 'Voting Status',
          value: financial?.canVote ? 'Eligible' : 'Blocked',
          sub: financial?.memberId ?? 'Member account',
          icon: 'pi pi-check-square',
          color: financial?.canVote ? 'var(--success)' : 'var(--danger)',
        },
        {
          label: 'Joining Fee',
          value: financial?.hasJoiningFee ? 'Paid' : 'Due',
          sub: 'One-time fee',
          icon: 'pi pi-wallet',
          color: financial?.hasJoiningFee ? 'var(--success)' : 'var(--warning)',
        },
        {
          label: 'Annual Fee',
          value: financial?.hasCurrentMembershipFee ? 'Current' : 'Due',
          sub: 'Membership fee',
          icon: 'pi pi-calendar',
          color: financial?.hasCurrentMembershipFee ? 'var(--success)' : 'var(--warning)',
        },
        {
          label: 'Open Elections',
          value: `${this.elections.openElections().length}`,
          sub: 'Available voting windows',
          icon: 'pi pi-bolt',
          color: 'var(--info)',
        },
      ];
    }

    return [
      {
        label: 'Members',
        value: `${this.members.totalRecords()}`,
        sub: `${this.members.entities().filter((member) => member.status === 'ACTIVE').length} active on page`,
        icon: 'pi pi-users',
        color: 'var(--p-primary-500)',
      },
      {
        label: 'Collected',
        value: `KES ${collected.toLocaleString()}`,
        sub: 'Verified fees',
        icon: 'pi pi-wallet',
        color: 'var(--success)',
      },
      {
        label: 'Pending Payments',
        value: `${pending}`,
        sub: 'Awaiting verification',
        icon: 'pi pi-clock',
        color: 'var(--warning)',
      },
      {
        label: 'Open Elections',
        value: `${this.elections.openElections().length}`,
        sub: 'Voting windows',
        icon: 'pi pi-check-square',
        color: 'var(--info)',
      },
      {
        label: 'Winners Stored',
        value: `${this.elections.history().length}`,
        sub: 'Leadership history',
        icon: 'pi pi-history',
        color: '#8b5cf6',
      },
    ];
  });

  recentPayments = computed(() => this.payments.entities().slice(0, 5));
  openElections = this.elections.openElections;

  paymentStatusData = computed(() => {
    const payments = this.payments.entities();
    const statuses = ['VERIFIED', 'PENDING', 'FAILED'];
    return {
      labels: statuses,
      datasets: [
        {
          data: statuses.map((status) => payments.filter((payment) => payment.status === status).length),
          backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
          borderWidth: 0,
        },
      ],
    };
  });

  feeTypeData = computed(() => {
    const payments = this.payments.entities();
    const feeTypes = ['JOINING_FEE', 'MEMBERSHIP_FEE'];
    return {
      labels: ['Joining', 'Membership'],
      datasets: [
        {
          label: 'Amount',
          data: feeTypes.map((feeType) =>
            payments
              .filter((payment) => payment.feeType === feeType && payment.status === 'VERIFIED')
              .reduce((sum, payment) => sum + Number(payment.amount), 0),
          ),
          backgroundColor: ['#3b82f6', '#22c55e'],
          borderRadius: 6,
        },
      ],
    };
  });

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { size: 10 }, padding: 12 },
      },
    },
  };

  barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { size: 11 } },
        grid: { display: false },
      },
      y: {
        ticks: { color: '#94a3b8', font: { size: 10 } },
        grid: { color: 'rgba(148, 163, 184, 0.14)' },
      },
    },
  };

  paymentSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'warn' | 'danger' | 'secondary'> = {
      VERIFIED: 'success',
      PENDING: 'warn',
      FAILED: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  electionSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    const map: Record<string, 'success' | 'warn' | 'danger' | 'info' | 'secondary'> = {
      OPEN: 'success',
      SCHEDULED: 'info',
      CLOSED: 'warn',
      TALLIED: 'secondary',
    };
    return map[status] ?? 'secondary';
  }

  feeLabel(payment: Payment) {
    return FEE_TYPE_LABELS[payment.feeType] ?? payment.feeType;
  }
}
