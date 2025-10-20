import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MaterialModule } from '../../shared/module/material';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/service/api/auth.service';
import { LocalStorageKey } from '../../constant/local_storage.constant';
import { LocalStorageService } from '../../shared/service/local-storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MaterialModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private readonly localStorageService = inject(LocalStorageService);

  loginForm!: FormGroup;
  hide = signal(true);

  private readonly subscription: Subscription = new Subscription();

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  submit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.subscription.add(
        this.authService.login(username, password).subscribe(token => {
          this.localStorageService.set(LocalStorageKey.ACCESSTOKEN, token.accessToken);
          this.localStorageService.set(LocalStorageKey.REFRESHTOKEN, token.refreshToken);
          this.router.navigate(['']);
        })
      )
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
