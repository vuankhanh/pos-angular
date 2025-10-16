import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { MaterialModule } from '../../shared/module/material';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/service/api/auth.service';
import { LocalStorageKey } from '../../constant/local_storage.constant';

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
  loginForm!: FormGroup;
  hide = signal(true);

  subscription: Subscription = new Subscription();
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {

  }

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    })
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
          localStorage.setItem(LocalStorageKey.ACCESSTOKEN, token.accessToken);
          localStorage.setItem(LocalStorageKey.REFRESHTOKEN, token.refreshToken);
          this.router.navigate(['']);
        })
      )
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
