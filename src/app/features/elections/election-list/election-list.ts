import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { AuthStore } from '../../../state/auth.store';
import { ElectionsStore } from '../../../state/elections.store';

@Component({
  selector: 'app-election-list',
  standalone: true,
  imports: [DashboardShellComponent, Button, Tag, DatePipe, RouterLink],
  templateUrl: './election-list.html',
  styleUrl: './election-list.css',
})
export class ElectionListComponent implements OnInit {
  readonly store = inject(ElectionsStore);
  readonly auth = inject(AuthStore);
  activeFilter = signal('All');
  filters = ['All', 'SCHEDULED', 'OPEN', 'CLOSED', 'TALLIED'];
  isAdmin = this.auth.isAdmin;

  ngOnInit() {
    this.store.loadElections();
    this.store.loadOpenElections();
  }

  elections = computed(() => {
    const list = this.store.elections();
    if (this.activeFilter() === 'All') return list;
    return list.filter((election) => election.status === this.activeFilter());
  });

  stats = computed(() => {
    const all = this.store.elections();
    return [
      { label: 'Elections', value: all.length, sub: 'All records', color: 'var(--text-muted)' },
      { label: 'Open', value: all.filter((election) => election.status === 'OPEN').length, sub: 'Voting live', color: 'var(--success)' },
      { label: 'Scheduled', value: all.filter((election) => election.status === 'SCHEDULED').length, sub: 'Upcoming', color: 'var(--info)' },
      { label: 'Tallied', value: all.filter((election) => election.status === 'TALLIED').length, sub: 'Results saved', color: 'var(--warning)' },
    ];
  });

  statusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    const map: Record<string, 'success' | 'warn' | 'danger' | 'info' | 'secondary'> = {
      OPEN: 'success',
      SCHEDULED: 'info',
      CLOSED: 'warn',
      TALLIED: 'secondary',
    };
    return map[status] ?? 'secondary';
  }
}
