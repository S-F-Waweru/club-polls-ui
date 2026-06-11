import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { addEntity, setAllEntities, updateEntity, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateMemberDto,
  Member,
  MemberFinancialStatus,
  PaginatedResponse,
  UpdateMemberDto,
} from '../models/club.models';

export interface MembersState {
  page: number;
  limit: number;
  totalRecords: number;
  selectedMember: Member | null;
  selectedFinancialStatus: MemberFinancialStatus | null;
  myProfile: Member | null;
  myFinancialStatus: MemberFinancialStatus | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MembersState = {
  page: 1,
  limit: 10,
  totalRecords: 0,
  selectedMember: null,
  selectedFinancialStatus: null,
  myProfile: null,
  myFinancialStatus: null,
  isLoading: false,
  error: null,
};

export const MembersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<Member>(),
  withMethods((store, http = inject(HttpClient)) => ({
    setPage: (page: number) => patchState(store, { page }),

    setLimit: (limit: number) => patchState(store, { limit, page: 1 }),

    loadMembers: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() => {
          const params = new HttpParams()
            .set('page', store.page().toString())
            .set('limit', store.limit().toString());

          return http.get<PaginatedResponse<Member>>(`${environment.apiUrl}members/paginated`, { params }).pipe(
            tap({
              next: (response) =>
                patchState(store, setAllEntities(response.data), {
                  totalRecords: response.total,
                  page: response.page,
                  isLoading: false,
                }),
              error: (err) =>
                patchState(store, {
                  error: err.error?.message || 'Failed to load club members.',
                  isLoading: false,
                }),
            }),
            catchError(() => EMPTY),
          );
        }),
      ),
    ),

    loadAllMembers: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          http.get<Member[]>(`${environment.apiUrl}members`).pipe(
            tap({
              next: (members) =>
                patchState(store, setAllEntities(members), {
                  totalRecords: members.length,
                  isLoading: false,
                }),
              error: (err) =>
                patchState(store, {
                  error: err.error?.message || 'Failed to load club members.',
                  isLoading: false,
                }),
            }),
            catchError(() => EMPTY),
          ),
        ),
      ),
    ),

    createMember: rxMethod<CreateMemberDto>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((dto) =>
          http.post<Member>(`${environment.apiUrl}members`, dto).pipe(
            tap((member) =>
              patchState(store, addEntity(member), {
                selectedMember: member,
                totalRecords: store.totalRecords() + 1,
                isLoading: false,
              }),
            ),
            catchError((err) => {
              patchState(store, {
                error: formatApiError(err, 'Failed to create member.'),
                isLoading: false,
              });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    loadMemberById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) =>
          http.get<Member>(`${environment.apiUrl}members/${id}`).pipe(
            tap({
              next: (member) =>
                patchState(store, updateEntity({ id: member.id, changes: member }), {
                  selectedMember: member,
                  isLoading: false,
                }),
              error: (err) =>
                patchState(store, {
                  error: err.error?.message || 'Failed to load member.',
                  isLoading: false,
                }),
            }),
            catchError(() => EMPTY),
          ),
        ),
      ),
    ),

    loadMemberByPublicId: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((memberId) =>
          http.get<Member>(`${environment.apiUrl}members/by-member-id/${memberId}`).pipe(
            tap({
              next: (member) =>
                patchState(store, updateEntity({ id: member.id, changes: member }), {
                  selectedMember: member,
                  isLoading: false,
                }),
              error: (err) =>
                patchState(store, {
                  error: err.error?.message || 'Failed to load member.',
                  isLoading: false,
                }),
            }),
            catchError(() => EMPTY),
          ),
        ),
      ),
    ),

    loadMyProfile: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          http.get<Member>(`${environment.apiUrl}members/me`).pipe(
            tap({
              next: (member) => patchState(store, { myProfile: member, isLoading: false }),
              error: (err) =>
                patchState(store, {
                  error: err.error?.message || 'Failed to load member profile.',
                  isLoading: false,
                }),
            }),
            catchError(() => EMPTY),
          ),
        ),
      ),
    ),

    loadFinancialStatus: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) =>
          http.get<MemberFinancialStatus>(`${environment.apiUrl}members/${id}/financial-status`).pipe(
            tap({
              next: (status) =>
                patchState(store, { selectedFinancialStatus: status, isLoading: false }),
              error: (err) =>
                patchState(store, {
                  error: err.error?.message || 'Failed to load member fee status.',
                  isLoading: false,
                }),
            }),
            catchError(() => EMPTY),
          ),
        ),
      ),
    ),

    loadMyFinancialStatus: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          http.get<MemberFinancialStatus>(`${environment.apiUrl}members/me/financial-status`).pipe(
            tap({
              next: (status) =>
                patchState(store, { myFinancialStatus: status, isLoading: false }),
              error: (err) =>
                patchState(store, {
                  error: err.error?.message || 'Failed to load your fee status.',
                  isLoading: false,
                }),
            }),
            catchError(() => EMPTY),
          ),
        ),
      ),
    ),

    updateMember: rxMethod<{ id: string; dto: UpdateMemberDto }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, dto }) =>
          http.patch<Member>(`${environment.apiUrl}members/${id}`, dto).pipe(
            tap({
              next: (member) =>
                patchState(store, updateEntity({ id: member.id, changes: member }), {
                  selectedMember: member,
                  isLoading: false,
                }),
              error: (err) =>
                patchState(store, {
                  error: formatApiError(err, 'Failed to update member.'),
                  isLoading: false,
                }),
            }),
            catchError(() => EMPTY),
          ),
        ),
      ),
    ),

    markFormer: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) =>
          http.delete<Member>(`${environment.apiUrl}members/${id}`).pipe(
            tap({
              next: (member) =>
                patchState(store, updateEntity({ id: member.id, changes: member }), {
                  selectedMember: member,
                  isLoading: false,
                }),
              error: (err) =>
                patchState(store, {
                  error: err.error?.message || 'Failed to mark member as former.',
                  isLoading: false,
                }),
            }),
            catchError(() => EMPTY),
          ),
        ),
      ),
    ),
  })),
);

function formatApiError(err: any, fallback: string) {
  return Array.isArray(err.error?.message) ? err.error.message.join(', ') : err.error?.message || fallback;
}
