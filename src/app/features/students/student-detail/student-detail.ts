import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { Tag } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { StudentsStore, InvoicePayment, StudentInvoice } from '../../../state/student.store';
import { Button } from 'primeng/button';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [DashboardShellComponent, Tag, CommonModule, Button, RouterLink, Tabs, TabPanel, TabList, Tab, TabPanels],
  templateUrl: './student-detail.html',
  styleUrl: './student-detail.css',
})
export class StudentDetailComponent {
  private route = inject(ActivatedRoute);
  protected store = inject(StudentsStore);
  private studentId = this.route.snapshot.paramMap.get('id');

  student = computed(() => this.store.entities().find((s) => s.studentId === this.studentId) ?? null);

  // Flat list of all payments across all enrollments
  allPayments = computed(() =>
    this.student()?.enrollments?.flatMap((e) =>
      (e.invoice?.payments ?? []).map((p) => ({
        ...p,
        courseName: e.course.name,
        courseCode: e.course.code,
        invoiceId: e.invoice.id,
      }))
    ) ?? []
  );

  // Invoices summary per enrollment
  allInvoices = computed(() =>
    this.student()?.enrollments?.map((e) => ({
      ...e.invoice,
      courseName: e.course.name,
      courseCode: e.course.code,
      enrollmentId: e.id,
    })) ?? []
  );

  // Balance summary
  balanceSummary = computed(() => {
    const invoices = this.allInvoices();
    const totalBilled = invoices.reduce((s, i) => s + (i?.totalAmount ?? 0), 0);
    const totalBalance = invoices.reduce((s, i) => s + (i?.balance ?? 0), 0);
    const totalPaid = totalBilled - totalBalance;
    return { totalBilled, totalPaid, totalBalance };
  });

  constructor() {
    if (this.studentId) this.store.loadStudentByStudentId(this.studentId);
  }

  statusSeverity(status: string): 'success' | 'danger' | 'info' | 'warn' | 'secondary' {
    const map: Record<string, any> = {
      ACTIVE: 'success', GRADUATED: 'info', WITHDRAWN: 'danger',
      PAID: 'success', PARTIAL: 'warn', UNPAID: 'danger',
      COMPLETED: 'info', DROPPED: 'danger',
      VERIFIED: 'success', PENDING: 'warn', REJECTED: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  getInitials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  }

  // Create a getter to safely handle the ID
  get currentStudentId(): string | undefined {
    return (this.student() as any)?.studentId; // Replace 'studentId' with the correct key
  }
}
