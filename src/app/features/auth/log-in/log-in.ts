import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '../../../state/auth.store';
import { Password } from 'primeng/password';
import { InputText } from 'primeng/inputtext';
import { Divider } from 'primeng/divider';
import { Button, ButtonDirective } from 'primeng/button';
import { AuthShellComponent } from '../../../core/components/auth-shell.component';

@Component({
  selector: 'log-in',
  imports: [Password, InputText, ReactiveFormsModule, Button, AuthShellComponent],
  templateUrl: './log-in.html',
  styleUrl: './log-in.css',
})
export class LogIn {
  readonly auth = inject(AuthStore);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  isInvalid(field: 'email' | 'password'): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.auth.login(this.form.getRawValue() as any);
  }
}
