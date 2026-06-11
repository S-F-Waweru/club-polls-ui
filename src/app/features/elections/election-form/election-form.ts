import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { CreateElectionDto } from '../../../models/club.models';
import { ElectionsStore } from '../../../state/elections.store';

@Component({
  selector: 'app-election-form',
  standalone: true,
  imports: [DashboardShellComponent, FormsModule, Button, InputText, RouterLink],
  templateUrl: './election-form.html',
  styleUrl: './election-form.css',
})
export class ElectionFormComponent {
  private readonly router = inject(Router);
  readonly store = inject(ElectionsStore);

  form = {
    title: '',
    description: '',
    startsAt: toLocalDateTime(new Date()),
    endsAt: '',
    votingWindowHours: 48,
  };

  submit() {
    if (!this.form.title) return;

    const dto: CreateElectionDto = {
      title: this.form.title,
      description: this.form.description || undefined,
      startsAt: this.form.startsAt ? new Date(this.form.startsAt).toISOString() : undefined,
      endsAt: this.form.endsAt ? new Date(this.form.endsAt).toISOString() : undefined,
      votingWindowHours: this.form.endsAt ? undefined : Number(this.form.votingWindowHours || 48),
    };

    this.store.createElection(dto);
    window.setTimeout(() => this.router.navigate(['/elections']), 250);
  }
}

function toLocalDateTime(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}
