import { Component, OnInit, computed, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { ElectionResult, POSITION_LABELS } from '../../../models/club.models';
import { ElectionsStore } from '../../../state/elections.store';

interface HistoryGroup {
  id: string;
  title: string;
  talliedAt: string;
  results: ElectionResult[];
}

@Component({
  selector: 'app-election-history',
  standalone: true,
  imports: [DashboardShellComponent, DatePipe, DecimalPipe, RouterLink, Button, Tag],
  templateUrl: './election-history.html',
  styleUrl: './election-history.css',
})
export class ElectionHistoryComponent implements OnInit {
  readonly store = inject(ElectionsStore);

  groups = computed<HistoryGroup[]>(() => {
    const map = new Map<string, HistoryGroup>();
    for (const result of this.store.history()) {
      const election = result.election;
      const id = election?.id ?? result.id;
      const existing = map.get(id);
      if (existing) {
        existing.results.push(result);
      } else {
        map.set(id, {
          id,
          title: election?.title ?? 'Tallied Election',
          talliedAt: result.talliedAt,
          results: [result],
        });
      }
    }
    return Array.from(map.values());
  });

  ngOnInit() {
    this.store.loadHistory();
  }

  positionLabel(result: ElectionResult) {
    return POSITION_LABELS[result.position] ?? result.position;
  }
}
