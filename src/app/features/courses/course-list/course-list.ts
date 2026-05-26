import { Component, inject, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { RouterLink } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { Course, CoursesStore } from '../../../state/courses.store';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [DashboardShellComponent, Button, TableModule, Tag, RouterLink, ConfirmDialog],
  templateUrl: './course-list.html',
})
export class CourseListComponent implements OnInit {
  store = inject(CoursesStore);
  private confirm = inject(ConfirmationService);

  ngOnInit() {
    this.store.load();
  }

  confirmDelete(c: Course) {
    this.confirm.confirm({
      message: `Delete "${c.name}"?`,
      header: 'Delete Course',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.store.deleteCourse(c.id),
    });
  }
}
