import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { CoursesStore } from '../../../state/courses.store';


@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [
    DashboardShellComponent,
    FormsModule,
    CommonModule,
    Button,
    InputText,
    Select,
    ToggleSwitch,
    RouterLink,
  ],
  templateUrl: './course-form.html',
})
export class CourseFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly store = inject(CoursesStore);

  isEdit = false;
  courseId = '';
  levelOptions = ['Beginner', 'Intermediate', 'Advanced'];

  form = {
    code: '',
    name: '',
    description: '',
    level: 'Beginner' as any,
    durationWeeks: 0,
    maxCapacity: 30,
    isActive: true,
  };
  fee = { totalAmount: 0, instalments: 1 };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.courseId = id;
      const course = this.store.entities().find((c) => c.id === id);
      if (course) {
        this.form = {
          code: course.code,
          name: course.name,
          description: course.description,
          level: course.level,
          durationWeeks: course.durationWeeks,
          maxCapacity: course.maxCapacity ?? 30,
          isActive: course.isActive ?? true,
        };
        if (course.feeStructure) {
          this.fee = {
            totalAmount: course.feeStructure.totalAmount,
            instalments: course.feeStructure.instalments,
          };
        }
      }
    }
  }

  submit() {
    if (this.isEdit) {
      this.store.updateCourse({ id: this.courseId, dto: this.form });
      const existing = this.store.entities().find((c) => c.id === this.courseId);
      if (existing?.feeStructure) {
        this.store.updateFee({
          id: existing.feeStructure.id,
          courseId: this.courseId,
          dto: this.fee,
        });
      } else {
        // this.store.addFee({ ...this.fee, course_id: this.courseId });
      }
    } else {
      // create course then add fee — handled via store chaining or two calls
      this.store.createCourseWithFee({ courseDto: this.form, feeDto: this.fee });
    }
    this.router.navigate(['/courses']);
  }
}
