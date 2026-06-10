// student-form.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { CreateStudentDto, StudentsStore } from '../../../state/student.store';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    DashboardShellComponent,
    FormsModule,
    CommonModule,
    Button,
    InputText,
    Select,
    RouterLink,
  ],
  templateUrl: './student-form.html',
})
export class StudentFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
   readonly store = inject(StudentsStore);

  isEdit = false;
  studentUUID = '';
  statusOptions = ['ACTIVE', 'GRADUATED', 'WITHDRAWN'];

  form: CreateStudentDto = {
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    admissionDate: '',
    status: 'ACTIVE',
    guardianName: '',
    guardianPhone: '',
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      const student = this.store.entities().find((s) => s.studentId === id);
      if (student) {
        this.studentUUID = student.id;
        this.form = {
          studentId: student.studentId,
          fullName: student.fullName,
          email: student.email,
          phone: student.phone,
          dateOfBirth: student.dateOfBirth || '',
          address: student.address || '',
          admissionDate: student.admissionDate,
          status: student.status,
          guardianName: student.guardianName || '',
          guardianPhone: student.guardianPhone || '',
        };
      }
    }
  }
  submit() {
    const { studentId, ...rest } = this.form;
    const payload = {
      ...rest,
      dateOfBirth: rest.dateOfBirth || undefined,
      address: rest.address || undefined,
      guardianName: rest.guardianName || undefined,
      guardianPhone: rest.guardianPhone || undefined,
    };

    if (this.isEdit) {
      this.store.updateStudent({ id: this.studentUUID, dto: payload });
    } else {
      this.store.createStudent(payload);
    }
    this.router.navigate(['/students']);
  }
  // submit() {
  //   const payload: CreateStudentDto = {
  //     ...this.form,
  //     // Remove empty optional fields instead of sending ""
  //     dateOfBirth: this.form.dateOfBirth || undefined,
  //     address: this.form.address || undefined,
  //     guardianName: this.form.guardianName || undefined,
  //     guardianPhone: this.form.guardianPhone || undefined,
  //   };
  //
  //   if (this.isEdit) {
  //     this.store.updateStudent({ id: this.studentUUID, dto: payload });
  //   } else {
  //     this.store.createStudent(payload);
  //   }
  //   this.router.navigate(['/students']);
  // }
}
