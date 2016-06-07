import { Component, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Account } from '../shared/account';
import { Stormpath, LoginFormModel, StormpathErrorResponse } from '../stormpath/stormpath.service';

@Component({
  selector: 'login-form',
  template: `
    <form *ngIf="(user$|async) == false">
      <input type="text" [(ngModel)]="loginFormModel.login">
      <input type="password" [(ngModel)]="loginFormModel.password">
      <div *ngIf="error">{{error}}</div>
      <button (click)="login()">Login</button>
    </form>
  `
})
@Injectable()
export class LoginComponent implements OnInit {
  protected loginFormModel: LoginFormModel;
  protected user$: Observable<Account | boolean>;
  protected loggedIn$: Observable<boolean>;
  protected error: string;
  constructor(public stormpath: Stormpath) {

  }
  ngOnInit() {
    this.user$ = this.stormpath.user$;
    this.loggedIn$ = this.user$.map(user => !!user);
    this.loginFormModel = {
      login: 'robert@stormpath.com',
      password: 'robert@stormpath.comA'
    };
  }
  login() {
    this.error = null;
    this.stormpath.login(this.loginFormModel)
      .subscribe(null, (error: StormpathErrorResponse) => {
        this.error = error.message;
      });
  }
};
