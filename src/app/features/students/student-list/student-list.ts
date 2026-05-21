import { Component, computed, signal } from '@angular/core';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Student } from '../../../state/student.store';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-student-list',
  imports: [
    DashboardShellComponent,
    Button,
    InputText,
    FormsModule,
    TableModule,
    Tag,
    DatePipe,
    RouterLink,
  ],
  templateUrl: './student-list.html',
  styleUrl: './student-list.css',
})
export class StudentListComponent {
  search = '';
  activeFilter = signal('All');
  filters = ['All', 'ACTIVE', 'GRADUATED', 'WITHDRAWN'];

  // Updated dummy data with new Student fields
  students = signal<Student[]>([
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      studentId: 'STU-001',
      fullName: 'Amara Osei',
      email: 'amara.osei@uni.ac.ke',
      phone: '+254712345678',
      dateOfBirth: '2002-05-12',
      address: 'Nairobi, Kenya',
      admissionDate: '2024-01-15',
      status: 'ACTIVE',
      guardianName: 'Kwame Osei',
      guardianPhone: '+254722123456',
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      studentId: 'STU-002',
      fullName: 'Brian Mutua',
      email: 'brian.mutua@uni.ac.ke',
      phone: '+254712345679',
      dateOfBirth: '2001-11-23',
      address: 'Kisumu, Kenya',
      admissionDate: '2024-01-20',
      status: 'ACTIVE',
      guardianName: undefined,
      guardianPhone: undefined,
      createdAt: '2024-01-20T09:30:00Z',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      studentId: 'STU-003',
      fullName: 'Cynthia Wanjiku',
      email: 'cynthia.wanjiku@uni.ac.ke',
      phone: '+254712345680',
      dateOfBirth: '2003-02-14',
      address: 'Nakuru, Kenya',
      admissionDate: '2024-02-01',
      status: 'ACTIVE',
      guardianName: 'Peter Wanjiku',
      guardianPhone: '+254733456789',
      createdAt: '2024-02-01T14:15:00Z',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      studentId: 'STU-004',
      fullName: 'David Kipchoge',
      email: 'david.kipchoge@uni.ac.ke',
      phone: '+254712345681',
      dateOfBirth: '2000-08-30',
      address: 'Eldoret, Kenya',
      admissionDate: '2023-09-10',
      status: 'WITHDRAWN',
      guardianName: undefined,
      guardianPhone: undefined,
      createdAt: '2023-09-10T08:45:00Z',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      studentId: 'STU-005',
      fullName: 'Esther Achieng',
      email: 'esther.achieng@uni.ac.ke',
      phone: '+254712345682',
      dateOfBirth: '2002-12-05',
      address: 'Kisii, Kenya',
      admissionDate: '2024-03-05',
      status: 'ACTIVE',
      guardianName: 'John Achieng',
      guardianPhone: '+254744567890',
      createdAt: '2024-03-05T11:20:00Z',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      studentId: 'STU-006',
      fullName: 'Felix Otieno',
      email: 'felix.otieno@uni.ac.ke',
      phone: '+254712345683',
      dateOfBirth: '2001-04-17',
      address: 'Mombasa, Kenya',
      admissionDate: '2024-02-20',
      status: 'ACTIVE',
      guardianName: undefined,
      guardianPhone: undefined,
      createdAt: '2024-02-20T16:00:00Z',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440006',
      studentId: 'STU-007',
      fullName: 'Grace Muthoni',
      email: 'grace.muthoni@uni.ac.ke',
      phone: '+254712345684',
      dateOfBirth: '2000-01-09',
      address: 'Nyeri, Kenya',
      admissionDate: '2023-08-15',
      status: 'GRADUATED',
      guardianName: 'James Muthoni',
      guardianPhone: '+254755678901',
      createdAt: '2023-08-15T12:00:00Z',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440007',
      studentId: 'STU-008',
      fullName: 'Hassan Abdi',
      email: 'hassan.abdi@uni.ac.ke',
      phone: '+254712345685',
      dateOfBirth: '2003-06-21',
      address: 'Garissa, Kenya',
      admissionDate: '2024-04-01',
      status: 'ACTIVE',
      guardianName: 'Ali Abdi',
      guardianPhone: '+254766789012',
      createdAt: '2024-04-01T09:00:00Z',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440008',
      studentId: 'STU-009',
      fullName: 'Irene Chebet',
      email: 'irene.chebet@uni.ac.ke',
      phone: '+254712345686',
      dateOfBirth: '2002-09-27',
      address: 'Kericho, Kenya',
      admissionDate: '2024-02-15',
      status: 'ACTIVE',
      guardianName: 'William Chebet',
      guardianPhone: '+254777890123',
      createdAt: '2024-02-15T13:30:00Z',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440009',
      studentId: 'STU-010',
      fullName: 'James Kamau',
      email: 'james.kamau@uni.ac.ke',
      phone: '+254712345687',
      dateOfBirth: '2001-07-11',
      address: 'Thika, Kenya',
      admissionDate: '2023-11-01',
      status: 'ACTIVE',
      guardianName: undefined,
      guardianPhone: undefined,
      createdAt: '2023-11-01T10:15:00Z',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440010',
      studentId: 'STU-011',
      fullName: 'Khadija Mohamed',
      email: 'khadija.mohamed@uni.ac.ke',
      phone: '+254712345688',
      dateOfBirth: '2002-03-18',
      address: 'Mombasa, Kenya',
      admissionDate: '2024-01-30',
      status: 'ACTIVE',
      guardianName: 'Mohamed Hassan',
      guardianPhone: '+254788901234',
      createdAt: '2024-01-30T14:45:00Z',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440011',
      studentId: 'STU-012',
      fullName: 'Liam Njoroge',
      email: 'liam.njoroge@uni.ac.ke',
      phone: '+254712345689',
      dateOfBirth: '2003-10-03',
      address: 'Nairobi, Kenya',
      admissionDate: '2024-03-20',
      status: 'ACTIVE',
      guardianName: 'Grace Njoroge',
      guardianPhone: '+254799012345',
      createdAt: '2024-03-20T08:00:00Z',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440012',
      studentId: 'STU-013',
      fullName: 'Mary Wambua',
      email: 'mary.wambua@uni.ac.ke',
      phone: '+254712345690',
      dateOfBirth: '2002-12-12',
      address: 'Machakos, Kenya',
      admissionDate: '2024-01-10',
      status: 'WITHDRAWN',
      guardianName: 'Peter Wambua',
      guardianPhone: '+254711223344',
      createdAt: '2024-01-10T15:00:00Z',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440013',
      studentId: 'STU-014',
      fullName: 'Noah Kariuki',
      email: 'noah.kariuki@uni.ac.ke',
      phone: '+254712345691',
      dateOfBirth: '2000-05-20',
      address: 'Nyeri, Kenya',
      admissionDate: '2023-06-05',
      status: 'GRADUATED',
      guardianName: undefined,
      guardianPhone: undefined,
      createdAt: '2023-06-05T11:30:00Z',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440014',
      studentId: 'STU-015',
      fullName: 'Olivia Adhiambo',
      email: 'olivia.adhiambo@uni.ac.ke',
      phone: '+254712345692',
      dateOfBirth: '2003-04-25',
      address: 'Kisumu, Kenya',
      admissionDate: '2024-02-25',
      status: 'ACTIVE',
      guardianName: 'Tom Adhiambo',
      guardianPhone: '+254722334455',
      createdAt: '2024-02-25T09:45:00Z',
    },
  ]);

  filtered = computed(() => {
    let list = this.students();
    if (this.activeFilter() !== 'All') {
      list = list.filter((s) => s.status === this.activeFilter());
    }
    const q = this.search.toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q),
      );
    }
    return list;
  });

  recent = computed(() => this.students().slice(0, 4));

  stats = computed(() => {
    const all = this.students();
    const active = all.filter((s) => s.status === 'ACTIVE').length;
    const graduated = all.filter((s) => s.status === 'GRADUATED').length;
    const withdrawn = all.filter((s) => s.status === 'WITHDRAWN').length;
    return [
      {
        label: 'Total Enrolled',
        value: all.length,
        sub: 'All programmes',
        color: 'var(--text-muted)',
      },
      { label: 'Active', value: active, sub: 'Currently enrolled', color: 'var(--success)' },
      { label: 'Graduated', value: graduated, sub: 'Completed', color: 'var(--info)' },
      { label: 'Withdrawn', value: withdrawn, sub: 'No longer active', color: 'var(--danger)' },
    ];
  });

  // Removed programmes() because course data is not in Student entity.
  // If needed, can be derived from enrollments relation later.

  statusSeverity(status: string): 'success' | 'danger' | 'info' | 'warn' | 'secondary' {
    const map: Record<string, 'success' | 'danger' | 'info' | 'warn' | 'secondary'> = {
      ACTIVE: 'success',
      WITHDRAWN: 'danger',
      GRADUATED: 'info',
    };
    return map[status] ?? 'secondary';
  }

  initials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

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
}
