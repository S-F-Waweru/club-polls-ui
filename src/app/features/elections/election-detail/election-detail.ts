import { Component, OnInit, computed, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import {
  Candidate,
  CLUB_POSITIONS,
  ClubPosition,
  CreateCandidateDto,
  POSITION_LABELS,
} from '../../../models/club.models';
import { AuthStore } from '../../../state/auth.store';
import { ElectionsStore } from '../../../state/elections.store';

@Component({
  selector: 'app-election-detail',
  standalone: true,
  imports: [DashboardShellComponent, FormsModule, Button, InputText, Select, Tag, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './election-detail.html',
  styleUrl: './election-detail.css',
})
export class ElectionDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(ElectionsStore);
  readonly auth = inject(AuthStore);

  readonly electionId = this.route.snapshot.paramMap.get('id')!;
  readonly positions = CLUB_POSITIONS;
  readonly isAdmin = this.auth.isAdmin;
  readonly isMember = this.auth.isMember;

  candidateForm: CreateCandidateDto = {
    memberId: '',
    position: 'CHAIRMAN',
    profilePhotoUrl: '',
    manifesto: '',
  };

  election = this.store.currentElection;
  candidates = this.store.candidates;
  results = this.store.results;

  ngOnInit() {
    this.store.loadElectionById(this.electionId);
    this.store.loadResults(this.electionId);
  }

  candidatesFor(position: ClubPosition) {
    return this.candidates().filter((candidate) => candidate.position === position && candidate.isActive);
  }

  resultsFor(position: ClubPosition) {
    return this.results().filter((result) => result.position === position);
  }

  resultFor(candidate: Candidate) {
    return this.results().find((result) => result.candidate?.id === candidate.id);
  }

  addCandidate() {
    if (!this.candidateForm.memberId) return;
    this.store.addCandidate({
      electionId: this.electionId,
      dto: cleanPayload(this.candidateForm),
    });
    this.candidateForm = {
      memberId: '',
      position: this.candidateForm.position,
      profilePhotoUrl: '',
      manifesto: '',
    };
  }

  castVote(candidate: Candidate) {
    this.store.castVote({ electionId: this.electionId, candidateId: candidate.id });
  }

  tally() {
    this.store.tallyElection(this.electionId);
  }

  positionLabel(position: ClubPosition) {
    return POSITION_LABELS[position];
  }

  statusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    const map: Record<string, 'success' | 'warn' | 'danger' | 'info' | 'secondary'> = {
      OPEN: 'success',
      SCHEDULED: 'info',
      CLOSED: 'warn',
      TALLIED: 'secondary',
    };
    return map[status] ?? 'secondary';
  }

  initials(name: string) {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  avatarBg(name: string) {
    const colors = ['#6366f1', '#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#14b8a6', '#8b5cf6', '#f97316'];
    return colors[name.charCodeAt(0) % colors.length];
  }
}

function cleanPayload<T extends Record<string, any>>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  ) as T;
}
