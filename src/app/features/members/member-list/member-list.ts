import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { Member } from '../../../models/club.models';
import { MembersStore } from '../../../state/members.store';

@Component({
  selector: 'app-member-list',
  standalone: true,
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
  templateUrl: './member-list.html',
  styleUrl: './member-list.css',
})
export class MemberListComponent implements OnInit {
  readonly store = inject(MembersStore);
  private readonly confirm = inject(ConfirmationService);

  search = '';
  activeFilter = signal('All');
  filters = ['All', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'FORMER'];

  members = this.store.entities;
  isLoading = this.store.isLoading;
  total = this.store.totalRecords;

  ngOnInit() {
    this.store.loadMembers();
  }

  filtered = computed(() => {
    let list = this.members();
    if (this.activeFilter() !== 'All') {
      list = list.filter((member) => member.status === this.activeFilter());
    }

    const q = this.search.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (member) =>
        member.fullName.toLowerCase().includes(q) ||
        member.memberId.toLowerCase().includes(q) ||
        member.email.toLowerCase().includes(q) ||
        member.phone.toLowerCase().includes(q),
    );
  });

  recent = computed(() => this.members().slice(0, 4));

  stats = computed(() => {
    const all = this.members();
    const active = all.filter((member) => member.status === 'ACTIVE').length;
    const former = all.filter((member) => member.status === 'FORMER').length;
    const suspended = all.filter((member) => member.status === 'SUSPENDED').length;

    return [
      { label: 'Total Members', value: this.total() || all.length, sub: 'Club records', color: 'var(--text-muted)' },
      { label: 'Active', value: active, sub: 'Eligible profile status', color: 'var(--success)' },
      { label: 'Former', value: former, sub: 'Preserved history', color: 'var(--info)' },
      { label: 'Suspended', value: suspended, sub: 'Restricted accounts', color: 'var(--danger)' },
    ];
  });

  statusSeverity(status: string): 'success' | 'danger' | 'info' | 'warn' | 'secondary' {
    const map: Record<string, 'success' | 'danger' | 'info' | 'warn' | 'secondary'> = {
      ACTIVE: 'success',
      INACTIVE: 'secondary',
      SUSPENDED: 'warn',
      FORMER: 'info',
    };
    return map[status] ?? 'secondary';
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

  confirmMarkFormer(member: Member) {
    this.confirm.confirm({
      message: `Mark ${member.fullName} as a former member?`,
      header: 'Update Member Status',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Mark Former',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.store.markFormer(member.id),
    });
  }

  onPageChange(event: any) {
    const page = (event.page ?? 0) + 1;
    const limit = event.rows ?? this.store.limit();

    if (limit !== this.store.limit()) {
      this.store.setLimit(limit);
    } else {
      this.store.setPage(page);
    }

    this.store.loadMembers();
  }
}
