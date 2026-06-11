import { Component, OnInit, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Select } from 'primeng/select';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { CreateMemberDto, MemberStatus, UpdateMemberDto } from '../../../models/club.models';
import { MembersStore } from '../../../state/members.store';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [DashboardShellComponent, FormsModule, Button, InputText, Password, Select, RouterLink],
  templateUrl: './member-form.html',
  styleUrl: './member-form.css',
})
export class MemberFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(MembersStore);

  readonly memberId = this.route.snapshot.paramMap.get('id');
  readonly isEdit = !!this.memberId;
  private patched = false;

  statusOptions: MemberStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'FORMER'];

  form: CreateMemberDto = {
    fullName: '',
    email: '',
    phone: '',
    password: '',
    profilePhotoUrl: '',
    joinedAt: new Date().toISOString().slice(0, 10),
    status: 'ACTIVE',
  };

  readonly patchForm = effect(() => {
    const member = this.store.selectedMember();
    if (!this.isEdit || this.patched || !member || member.id !== this.memberId) return;

    this.form = {
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      password: '',
      profilePhotoUrl: member.profilePhotoUrl ?? '',
      joinedAt: member.joinedAt,
      status: member.status,
    };
    this.patched = true;
  });

  ngOnInit() {
    if (this.memberId) {
      this.store.loadMemberById(this.memberId);
    }
  }

  submit() {
    if (!this.form.fullName || !this.form.email || !this.form.phone) return;
    if (!this.isEdit && !this.form.password) return;

    if (this.isEdit && this.memberId) {
      const dto: UpdateMemberDto = cleanPayload({
        ...this.form,
        password: this.form.password || undefined,
      });
      this.store.updateMember({ id: this.memberId, dto });
      window.setTimeout(() => this.router.navigate(['/members', this.memberId]), 250);
      return;
    }

    this.store.createMember(cleanPayload(this.form) as CreateMemberDto);
    window.setTimeout(() => this.router.navigate(['/members']), 250);
  }
}

function cleanPayload<T extends Record<string, any>>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  ) as T;
}
