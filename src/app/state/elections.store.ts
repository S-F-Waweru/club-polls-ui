import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Candidate,
  ClubPosition,
  CreateCandidateDto,
  CreateElectionDto,
  Election,
  ElectionResult,
} from '../models/club.models';

export interface ElectionsState {
  elections: Election[];
  openElections: Election[];
  currentElection: Election | null;
  candidates: Candidate[];
  results: ElectionResult[];
  history: ElectionResult[];
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ElectionsState = {
  elections: [],
  openElections: [],
  currentElection: null,
  candidates: [],
  results: [],
  history: [],
  isLoading: false,
  error: null,
  successMessage: null,
};

export const ElectionsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, http = inject(HttpClient)) => ({
    loadElections: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, successMessage: null })),
        switchMap(() =>
          http.get<Election[]>(`${environment.apiUrl}elections`).pipe(
            tap({
              next: (elections) => patchState(store, { elections, isLoading: false }),
              error: (err) =>
                patchState(store, {
                  error: err.error?.message || 'Failed to load elections.',
                  isLoading: false,
                }),
            }),
            catchError(() => EMPTY),
          ),
        ),
      ),
    ),

    loadOpenElections: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, successMessage: null })),
        switchMap(() =>
          http.get<Election[]>(`${environment.apiUrl}elections/open`).pipe(
            tap({
              next: (openElections) => patchState(store, { openElections, isLoading: false }),
              error: (err) =>
                patchState(store, {
                  error: err.error?.message || 'Failed to load open elections.',
                  isLoading: false,
                }),
            }),
            catchError(() => EMPTY),
          ),
        ),
      ),
    ),

    createElection: rxMethod<CreateElectionDto>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, successMessage: null })),
        switchMap((dto) =>
          http.post<Election>(`${environment.apiUrl}elections`, dto).pipe(
            tap((election) =>
              patchState(store, {
                elections: [election, ...store.elections()],
                currentElection: election,
                isLoading: false,
                successMessage: 'Election saved.',
              }),
            ),
            catchError((err) => {
              patchState(store, {
                error: formatApiError(err, 'Failed to save election.'),
                isLoading: false,
              });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    loadElectionById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, successMessage: null })),
        switchMap((id) =>
          http.get<Election>(`${environment.apiUrl}elections/${id}`).pipe(
            tap({
              next: (election) =>
                patchState(store, {
                  currentElection: election,
                  candidates: election.candidates ?? [],
                  results: election.results ?? [],
                  isLoading: false,
                }),
              error: (err) =>
                patchState(store, {
                  error: err.error?.message || 'Failed to load election.',
                  isLoading: false,
                }),
            }),
            catchError(() => EMPTY),
          ),
        ),
      ),
    ),

    updateElection: rxMethod<{ id: string; dto: Partial<CreateElectionDto> }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, successMessage: null })),
        switchMap(({ id, dto }) =>
          http.patch<Election>(`${environment.apiUrl}elections/${id}`, dto).pipe(
            tap({
              next: (election) => {
                const elections = store.elections().map((item) =>
                  item.id === election.id ? election : item,
                );
                patchState(store, {
                  elections,
                  currentElection: election,
                  isLoading: false,
                  successMessage: 'Election updated.',
                });
              },
              error: (err) =>
                patchState(store, {
                  error: formatApiError(err, 'Failed to update election.'),
                  isLoading: false,
                }),
            }),
            catchError(() => EMPTY),
          ),
        ),
      ),
    ),

    addCandidate: rxMethod<{ electionId: string; dto: CreateCandidateDto }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, successMessage: null })),
        switchMap(({ electionId, dto }) =>
          http.post<Candidate>(`${environment.apiUrl}elections/${electionId}/candidates`, dto).pipe(
            tap({
              next: (candidate) => {
                const candidates = [candidate, ...store.candidates()];
                const currentElection = store.currentElection();
                patchState(store, {
                  candidates,
                  currentElection: currentElection
                    ? { ...currentElection, candidates }
                    : currentElection,
                  isLoading: false,
                  successMessage: 'Candidate added.',
                });
              },
              error: (err) =>
                patchState(store, {
                  error: formatApiError(err, 'Failed to add candidate.'),
                  isLoading: false,
                }),
            }),
            catchError(() => EMPTY),
          ),
        ),
      ),
    ),

    loadCandidates: rxMethod<{ electionId: string; position?: ClubPosition }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, successMessage: null })),
        switchMap(({ electionId, position }) => {
          let params = new HttpParams();
          if (position) params = params.set('position', position);

          return http.get<Candidate[]>(`${environment.apiUrl}elections/${electionId}/candidates`, { params }).pipe(
            tap({
              next: (candidates) => patchState(store, { candidates, isLoading: false }),
              error: (err) =>
                patchState(store, {
                  error: err.error?.message || 'Failed to load candidates.',
                  isLoading: false,
                }),
            }),
            catchError(() => EMPTY),
          );
        }),
      ),
    ),

    castVote: rxMethod<{ electionId: string; candidateId: string }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, successMessage: null })),
        switchMap(({ electionId, candidateId }) =>
          http.post<{ message: string }>(`${environment.apiUrl}elections/${electionId}/votes`, { candidateId }).pipe(
            tap((response) =>
              patchState(store, {
                isLoading: false,
                successMessage: response.message || 'Vote recorded.',
              }),
            ),
            catchError((err) => {
              patchState(store, {
                error: err.error?.message || 'Vote could not be recorded.',
                isLoading: false,
              });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    tallyElection: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, successMessage: null })),
        switchMap((electionId) =>
          http.post<ElectionResult[]>(`${environment.apiUrl}elections/${electionId}/tally`, {}).pipe(
            tap((results) =>
              patchState(store, {
                results,
                currentElection: store.currentElection()
                  ? { ...store.currentElection()!, status: 'TALLIED', results }
                  : store.currentElection(),
                isLoading: false,
                successMessage: 'Election tallied.',
              }),
            ),
            catchError((err) => {
              patchState(store, {
                error: err.error?.message || 'Failed to tally election.',
                isLoading: false,
              });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    loadResults: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, successMessage: null })),
        switchMap((electionId) =>
          http.get<ElectionResult[]>(`${environment.apiUrl}elections/${electionId}/results`).pipe(
            tap({
              next: (results) => patchState(store, { results, isLoading: false }),
              error: (err) =>
                patchState(store, {
                  error: err.error?.message || 'Failed to load results.',
                  isLoading: false,
                }),
            }),
            catchError(() => EMPTY),
          ),
        ),
      ),
    ),

    loadHistory: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, successMessage: null })),
        switchMap(() =>
          http.get<ElectionResult[]>(`${environment.apiUrl}elections/history/leaders`).pipe(
            tap({
              next: (history) => patchState(store, { history, isLoading: false }),
              error: (err) =>
                patchState(store, {
                  error: err.error?.message || 'Failed to load leadership history.',
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
