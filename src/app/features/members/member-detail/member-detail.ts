import { Component, OnInit, computed, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { FEE_TYPE_LABELS, Payment } from '../../../models/club.models';
import { MembersStore } from '../../../state/members.store';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [DashboardShellComponent, Button, TableModule, Tag, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './member-detail.html',
  styleUrl: './member-detail.css',
})
export class MemberDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(MembersStore);
  readonly memberId = this.route.snapshot.paramMap.get('id')!;

  member = computed(() => this.store.selectedMember());
  payments = computed(() => this.member()?.payments ?? []);
  financial = this.store.selectedFinancialStatus;

  ngOnInit() {
    this.store.loadMemberById(this.memberId);
    this.store.loadFinancialStatus(this.memberId);
  }

  statusSeverity(status: string): 'success' | 'danger' | 'info' | 'warn' | 'secondary' {
    const map: Record<string, 'success' | 'danger' | 'info' | 'warn' | 'secondary'> = {
      ACTIVE: 'success',
      INACTIVE: 'secondary',
      SUSPENDED: 'warn',
      FORMER: 'info',
    };
    return map[status] ?? 'secondary';
  }

  paymentSeverity(status: string): 'success' | 'danger' | 'warn' | 'secondary' {
    const map: Record<string, 'success' | 'danger' | 'warn' | 'secondary'> = {
      VERIFIED: 'success',
      PENDING: 'warn',
      FAILED: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  feeLabel(payment: Payment) {
    return FEE_TYPE_LABELS[payment.feeType] ?? payment.feeType;
  }

  initials(name: string) {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  avatarBg(name: string) {
    const colors = ['#6366f1', '#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#14b8a6', '#8b5cf6', '#f97316'];
    return colors[name.charCodeAt(0) % colors.length];
  }
}
