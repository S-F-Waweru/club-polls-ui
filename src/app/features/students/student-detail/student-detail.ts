import { Component, signal, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { Tag } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { StudentsStore } from '../../../state/student.store';
import { Button } from 'primeng/button';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [
    DashboardShellComponent,
    Tag,
    CommonModule,
    Button,
    RouterLink,
    Tabs,
    TabPanel,
    TabList,
    Tab,
    TabPanels,
  ],
  templateUrl: './student-detail.html',
  styleUrl: './student-detail.css',
})
export class StudentDetailComponent {
  private route = inject(ActivatedRoute);
  private store = inject(StudentsStore);

  private studentId = this.route.snapshot.paramMap.get('id');

  student = computed(
    () => this.store.entities().find((s) => s.studentId === this.studentId) ?? null,
  );

  constructor() {
    if (this.studentId) {
      this.store.loadStudentByStudentId(this.studentId);
    }
  }

  statusSeverity(status: string): 'success' | 'danger' | 'info' | 'warn' | 'secondary' {
    const map: Record<string, any> = {
      ACTIVE: 'success',
      GRADUATED: 'info',
      WITHDRAWN: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
