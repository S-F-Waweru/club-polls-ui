import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { HttpClient, HttpParams } from '@angular/common/http';
import { pipe, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';

// ============================================================
// Filter
// ============================================================
export interface AnalyticsFilter {
  year?: string;
  from?: string;
  to?: string;
}

// ============================================================
// Dashboard
// ============================================================
export interface DashboardOverview {
  students: { total: number; active: number };
  courses: { total: number; active: number };
  enrollments: { total: number };
  finance: {
    totalRevenue: number;
    outstandingBalance: number;
    pendingPayments: number;
    unpaidInvoices: number;
  };
}

// ============================================================
// Financial
// ============================================================
export interface RevenueByMonth {
  month: string;
  revenue: string;
}

export interface MethodBreakdown {
  method: string;
  total: string;
  count: string;
}

export interface InvoiceBreakdown {
  status: string;
  count: string;
  totalAmount: string;
  balance: string;
}

export interface FinancialSummary {
  billed: number;
  collected: number;
  outstanding: number;
  collectionRate: number;
}

export interface FinancialOverview {
  revenueByMonth: RevenueByMonth[];
  methodBreakdown: MethodBreakdown[];
  invoiceBreakdown: InvoiceBreakdown[];
  summary: FinancialSummary;
}

// ============================================================
// Students
// ============================================================
export interface StatusBreakdown {
  status: string;
  count: string;
}

export interface Debtor {
  studentId: string;
  fullName: string;
  totalOwed: string;
}

export interface StudentsOverview {
  statusBreakdown: StatusBreakdown[];
  newPerMonth: { month: string; count: string }[];
  debtors: Debtor[];
}

// ============================================================
// Courses
// ============================================================
export interface CourseEnrollment {
  courseId: string;
  code: string;
  name: string;
  maxCapacity: number;
  enrolled: string;
}

export interface CourseRevenue {
  courseId: string;
  code: string;
  name: string;
  totalBilled: string;
  outstanding: string;
}

export interface CoursesOverview {
  enrollmentPerCourse: CourseEnrollment[];
  revenuePerCourse: CourseRevenue[];
  enrollmentsPerMonth: { month: string; count: string }[];
}

// ============================================================
// Payments
// ============================================================
export interface PaymentStatusBreakdown {
  status: string;
  count: string;
  total: string;
}

export interface PaymentsOverview {
  statusBreakdown: PaymentStatusBreakdown[];
  methodBreakdown: { method: string; count: string; total: string }[];
  paymentsPerMonth: { month: string; total: string; count: string }[];
  rejected: { count: number; total: number };
}

// ============================================================
// Invoices
// ============================================================
export interface InvoiceStatusBreakdown {
  status: string;
  count: string;
  totalAmount: string;
  balance: string;
}

export interface TopUnpaid {
  id: string;
  totalAmount: number;
  balance: number;
  studentId: string;
  studentName: string;
  courseName: string;
}

export interface InvoicesOverview {
  statusBreakdown: InvoiceStatusBreakdown[];
  issuedPerMonth: { month: string; count: string; totalAmount: string }[];
  topUnpaid: TopUnpaid[];
}

// ============================================================
// State
// ============================================================
export interface AnalyticsState {
  filter: AnalyticsFilter;
  isLoading: boolean;
  error: string | null;
  dashboard: DashboardOverview | null;
  financial: FinancialOverview | null;
  students: StudentsOverview | null;
  courses: CoursesOverview | null;
  payments: PaymentsOverview | null;
  invoices: InvoicesOverview | null;
}

const initialState: AnalyticsState = {
  filter: {},
  isLoading: false,
  error: null,
  dashboard: null,
  financial: null,
  students: null,
  courses: null,
  payments: null,
  invoices: null,
};

// ============================================================
// Store
// ============================================================
export const AnalyticsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withMethods((store, http = inject(HttpClient)) => {

    function buildParams(filter: AnalyticsFilter): HttpParams {
      let params = new HttpParams();
      if (filter.year) params = params.set('year', filter.year);
      if (filter.from) params = params.set('from', filter.from);
      if (filter.to) params = params.set('to', filter.to);
      return params;
    }

    const loadDashboard = rxMethod<AnalyticsFilter>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((filter) =>
          http.get<DashboardOverview>(`${environment.apiUrl}analytics/dashboard`, { params: buildParams(filter) }).pipe(
            tap({
              next: (data) => patchState(store, { dashboard: data, isLoading: false }),
              error: (err) => patchState(store, { error: err.error?.message || 'Failed to load dashboard.', isLoading: false }),
            }),
          ),
        ),
      ),
    );

    const loadFinancial = rxMethod<AnalyticsFilter>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((filter) =>
          http.get<FinancialOverview>(`${environment.apiUrl}analytics/financial`, { params: buildParams(filter) }).pipe(
            tap({
              next: (data) => patchState(store, { financial: data, isLoading: false }),
              error: (err) => patchState(store, { error: err.error?.message || 'Failed to load financial overview.', isLoading: false }),
            }),
          ),
        ),
      ),
    );

    const loadStudents = rxMethod<AnalyticsFilter>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((filter) =>
          http.get<StudentsOverview>(`${environment.apiUrl}analytics/students`, { params: buildParams(filter) }).pipe(
            tap({
              next: (data) => patchState(store, { students: data, isLoading: false }),
              error: (err) => patchState(store, { error: err.error?.message || 'Failed to load students overview.', isLoading: false }),
            }),
          ),
        ),
      ),
    );

    const loadCourses = rxMethod<AnalyticsFilter>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((filter) =>
          http.get<CoursesOverview>(`${environment.apiUrl}analytics/courses`, { params: buildParams(filter) }).pipe(
            tap({
              next: (data) => patchState(store, { courses: data, isLoading: false }),
              error: (err) => patchState(store, { error: err.error?.message || 'Failed to load courses overview.', isLoading: false }),
            }),
          ),
        ),
      ),
    );

    const loadPayments = rxMethod<AnalyticsFilter>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((filter) =>
          http.get<PaymentsOverview>(`${environment.apiUrl}analytics/payments`, { params: buildParams(filter) }).pipe(
            tap({
              next: (data) => patchState(store, { payments: data, isLoading: false }),
              error: (err) => patchState(store, { error: err.error?.message || 'Failed to load payments overview.', isLoading: false }),
            }),
          ),
        ),
      ),
    );

    const loadInvoices = rxMethod<AnalyticsFilter>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((filter) =>
          http.get<InvoicesOverview>(`${environment.apiUrl}analytics/invoices`, { params: buildParams(filter) }).pipe(
            tap({
              next: (data) => patchState(store, { invoices: data, isLoading: false }),
              error: (err) => patchState(store, { error: err.error?.message || 'Failed to load invoices overview.', isLoading: false }),
            }),
          ),
        ),
      ),
    );

    return {
      setFilter: (filter: AnalyticsFilter) => patchState(store, { filter }),

      loadDashboard: (filter?: AnalyticsFilter) =>
        loadDashboard(filter ?? store.filter()),

      loadFinancial: (filter?: AnalyticsFilter) =>
        loadFinancial(filter ?? store.filter()),

      loadStudents: (filter?: AnalyticsFilter) =>
        loadStudents(filter ?? store.filter()),

      loadCourses: (filter?: AnalyticsFilter) =>
        loadCourses(filter ?? store.filter()),

      loadPayments: (filter?: AnalyticsFilter) =>
        loadPayments(filter ?? store.filter()),

      loadInvoices: (filter?: AnalyticsFilter) =>
        loadInvoices(filter ?? store.filter()),

      // Load all at once — used by dashboard page
      loadAll: (filter?: AnalyticsFilter) => {
        const f = filter ?? store.filter();
        loadDashboard(f);
        loadFinancial(f);
        loadStudents(f);
        loadCourses(f);
        loadPayments(f);
        loadInvoices(f);
      },
    };
  }),
);
