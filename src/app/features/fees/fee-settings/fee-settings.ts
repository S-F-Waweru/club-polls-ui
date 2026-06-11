import { Component, OnInit, effect, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { MembershipFeeCycle, UpsertFeeSettingDto } from '../../../models/club.models';
import { FeeSettingsStore } from '../../../state/fee-settings.store';

@Component({
  selector: 'app-fee-settings',
  standalone: true,
  imports: [DashboardShellComponent, FormsModule, Button, InputText, Select, DecimalPipe, DatePipe],
  templateUrl: './fee-settings.html',
  styleUrl: './fee-settings.css',
})
export class FeeSettingsComponent implements OnInit {
  readonly store = inject(FeeSettingsStore);
  private patched = false;

  cycleOptions: MembershipFeeCycle[] = ['ANNUAL', 'QUARTERLY', 'MONTHLY'];

  form: UpsertFeeSettingDto = {
    joiningFee: 0,
    membershipFee: 0,
    membershipFeeCycle: 'ANNUAL',
    currency: 'KES',
    notes: '',
  };

  readonly patchForm = effect(() => {
    const current = this.store.current();
    if (!current || this.patched) return;

    this.form = {
      joiningFee: Number(current.joiningFee),
      membershipFee: Number(current.membershipFee),
      membershipFeeCycle: current.membershipFeeCycle,
      currency: current.currency,
      notes: current.notes ?? '',
    };
    this.patched = true;
  });

  ngOnInit() {
    this.store.loadCurrent();
  }

  submit() {
    this.store.updateCurrent({
      ...this.form,
      joiningFee: Number(this.form.joiningFee),
      membershipFee: Number(this.form.membershipFee),
      notes: this.form.notes || undefined,
    });
  }
}
