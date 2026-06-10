import { Component, inject, computed, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { RouterLink } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { Course, CoursesStore } from '../../../state/courses.store';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [
    DashboardShellComponent,
    Button,
    TableModule,
    Tag,
    RouterLink,
    ConfirmDialog,
    InputText,
    FormsModule,
    DecimalPipe,
    DatePipe,
  ],
  templateUrl: './course-list.html',
})
export class CourseListComponent {
  store = inject(CoursesStore);
  private confirm = inject(ConfirmationService);

  search = signal('');
  activeLevel = signal('All');
  levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Client‑side filter (search + level) on the current page
  filteredCourses = computed(() => {
    let list = this.store.entities();
    const level = this.activeLevel();
    if (level !== 'All') {
      list = list.filter((c) => c.level === level);
    }
    const q = this.search().toLowerCase();
    if (q) {
      list = list.filter(
        (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
      );
    }
    return list;
  });

  // Stats cards based on current page (like student list)
  stats = computed(() => {
    const all = this.filteredCourses();
    const active = all.filter((c) => c.isActive).length;
    const beginner = all.filter((c) => c.level === 'Beginner').length;
    const intermediate = all.filter((c) => c.level === 'Intermediate').length;
    const advanced = all.filter((c) => c.level === 'Advanced').length;
    return [
      {
        label: 'Total Courses',
        value: all.length,
        sub: 'on this page',
        color: 'var(--text-muted)',
      },
      { label: 'Active', value: active, sub: 'Currently active', color: 'var(--success)' },
      { label: 'Beginner', value: beginner, sub: 'Entry level', color: 'var(--info)' },
      {
        label: 'Int. / Adv.',
        value: intermediate + advanced,
        sub: 'Higher levels',
        color: 'var(--primary-500)',
      },
    ];
  });

  // Side panel: recent courses (most recent 3 from current page)
  recentCourses = computed(() => this.store.entities().slice(0, 3));

  confirmDelete(c: Course) {
    this.confirm.confirm({
      message: `Delete "${c.name}"?`,
      header: 'Delete Course',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.store.deleteCourse(c.id),
    });
  }

  // Helper for pagination events (if using p-table paginator with store)
  onPageChange(event: any) {
    const newPage = (event.page ?? 0) + 1;
    const newLimit = event.rows ?? 10;
    if (newLimit !== this.store.limit()) {
      this.store.setLimit(newLimit);
    } else {
      this.store.setPage(newPage);
    }
  }

  // Avatar bg (reusing student list style, optional)
  avatarBg(name: string) {
    const colors = [
      '#6366f1',
      '#22c55e',
      '#f59e0b',
      '#3b82f6',
      '#ec4899',
      '#14b8a6',
      '#8b5cf6',
      '#f97316',
    ];
    const i = name.charCodeAt(0) % colors.length;
    return colors[i];
  }

  initials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  protected readonly Math = Math;
}
