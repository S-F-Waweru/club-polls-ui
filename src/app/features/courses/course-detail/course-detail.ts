import { Component, inject, computed, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { Tag } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { CoursesStore } from '../../../state/courses.store';
import { Button } from 'primeng/button';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'app-course-detail',
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
    Skeleton,
  ],
  templateUrl: './course-detail.html',
})
export class CourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private store = inject(CoursesStore);

  courseId = this.route.snapshot.paramMap.get('id')!;

  // Find course in store (will be populated after load)
  course = computed(() => this.store.entities().find((c) => c.id === this.courseId) ?? null);
  isLoading = this.store.isLoading;
  error = this.store.error;

  ngOnInit() {
    if (this.courseId) {
      this.store.loadCourseById(this.courseId);
    }
  }

  statusSeverity(isActive: boolean): 'success' | 'danger' | 'secondary' {
    return isActive ? 'success' : 'danger';
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  // For demo: placeholder enrollments (would come from a separate store/endpoint)
  // You can later replace with real data from EnrollmentsStore
  enrollments = computed(() => [] as any[]);
}
