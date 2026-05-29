import { Component, inject, computed, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { Tag } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { CoursesStore } from '../../../state/courses.store';
import { Button } from 'primeng/button';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Skeleton } from 'primeng/skeleton';
import { EnrollmentsStore } from '../../../state/ennrollment.store';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [DashboardShellComponent, Tag, CommonModule, Button, RouterLink, Tabs, TabPanel, TabList, Tab, TabPanels, Skeleton],
  templateUrl: './course-detail.html',
})
export class CourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private store = inject(CoursesStore);
  private enrollmentsStore = inject(EnrollmentsStore);

  courseId = this.route.snapshot.paramMap.get('id')!;

  course = computed(() => this.store.entities().find((c) => c.id === this.courseId) ?? null);
  isLoading = this.store.isLoading;
  error = this.store.error;

  // All enrollments for this course
  enrollments = computed(() =>
    this.enrollmentsStore.entities().filter((e) => e.course.id === this.courseId)
  );

  // Flat payments across all enrollments
  allPayments = computed(() =>
    this.enrollments().flatMap((e) =>
      // invoice has no payments here — link to invoice detail instead
      e.invoice ? [{ ...e.invoice, studentName: e.student.fullName, studentId: e.student.studentId }] : []
    )
  );

  // Balance summary
  balanceSummary = computed(() => {
    const enrollments = this.enrollments();
    const totalBilled = enrollments.reduce((s, e) => s + (e.invoice?.totalAmount ?? 0), 0);
    const totalBalance = enrollments.reduce((s, e) => s + (e.invoice?.balance ?? 0), 0);
    return { totalBilled, totalPaid: totalBilled - totalBalance, totalBalance };
  });

  ngOnInit() {
    if (this.courseId) {
      this.store.loadCourseById(this.courseId);
      this.enrollmentsStore.loadByCourseId(this.courseId);
    }
  }

  statusSeverity(val: boolean | string): 'success' | 'danger' | 'warn' | 'info' | 'secondary' {
    if (typeof val === 'boolean') return val ? 'success' : 'danger';
    const map: Record<string, any> = {
      ACTIVE: 'success', COMPLETED: 'info', DROPPED: 'danger',
      PAID: 'success', PARTIAL: 'warn', UNPAID: 'danger',
    };
    return map[val] ?? 'secondary';
  }

  getInitials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  }
}
