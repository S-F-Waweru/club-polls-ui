import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { StudentsStore } from '../../../state/student.store';
import { EnrollmentsStore } from '../../../state/ennrollment.store';
import { CoursesStore } from '../../../state/courses.store';


@Component({
  selector: 'app-enrollment-form',
  standalone: true,
  imports: [DashboardShellComponent, Button, Select, ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './enrollment-form.html',
  styleUrl: './enrollment-form.css',
})
export class EnrollmentFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  enrollmentStore = inject(EnrollmentsStore);
  studentStore = inject(StudentsStore);
  courseStore = inject(CoursesStore);

  // Edit mode: enrollment UUID from route
  enrollmentId = this.route.snapshot.paramMap.get('id');
  isEditMode = !!this.enrollmentId;

  isLoading = this.enrollmentStore.isLoading;
  error = this.enrollmentStore.error;

  // Dropdown options
  studentOptions = computed(() =>
    this.studentStore.entities().map((s) => ({
      label: `${s.fullName} (${s.studentId})`,
      value: s.id,
    })),
  );

  courseOptions = computed(() =>
    this.courseStore
      .entities()
      .filter((c) => c.isActive)
      .map((c) => ({
        label: `${c.name} — ${c.code}`,
        value: c.id,
      })),
  );

  statusOptions = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Dropped', value: 'DROPPED' },
  ];

  form = this.fb.group({
    student_id: ['', Validators.required],
    course_id: ['', Validators.required],
    status: ['ACTIVE'], // only used in edit mode
  });

  ngOnInit() {
    if (this.isEditMode && this.enrollmentId) {
      const existing = this.enrollmentStore.entities().find((e) => e.id === this.enrollmentId);
      if (existing) {
        this.form.patchValue({ status: existing.status });
        // student + course are read-only in edit mode
        this.form.get('student_id')?.disable();
        this.form.get('course_id')?.disable();
      } else {
        this.enrollmentStore.loadEnrollmentById(this.enrollmentId);
      }
    }
  }

  submit() {
    if (this.form.invalid) return;

    if (this.isEditMode && this.enrollmentId) {
      this.enrollmentStore.updateEnrollment({
        id: this.enrollmentId,
        dto: { status: this.form.value.status as any },
      });
    } else {
      this.enrollmentStore.createEnrollment({
        student_id: this.form.value.student_id!,
        course_id: this.form.value.course_id!,
      });
    }

    // Navigate back after action (store handles errors in state)
    setTimeout(() => {
      if (!this.enrollmentStore.error()) {
        this.router.navigate(['/enrollments']);
      }
    }, 500);
  }

  get submitLabel() {
    return this.isEditMode ? 'Update Enrollment' : 'Enroll Student';
  }
  get submitIcon() {
    return this.isEditMode ? 'pi pi-check' : 'pi pi-plus';
  }
}
