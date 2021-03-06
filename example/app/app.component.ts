/// <reference path="../typings/tsd.d.ts" />

import { Component, OnInit } from '@angular/core';
import { HTTP_PROVIDERS }    from '@angular/http';
import { Observable } from 'rxjs/Observable';

import {
  Account,
  AuthPortComponent,
  Stormpath
} from 'ng2-stormpath/ng2-stormpath';

@Component({
  selector: 'my-app',
  template: `

      <div class="container">
        <br/>
        <br/>
        <div *ngIf="(user$ | async)" class="row text-center">
          <h2 class="">
            Welcome, ({{ ( user$ | async ).fullName }}).
          </h2>
          <hr/>
          <h4>What would you like to do?</h4>

          <ul class="nav nav-pills nav-stacked text-centered">
            <li role="presentation" (click)="showLogin()"><a href="#">Edit My Profile</a></li>
            <li role="presentation" (click)="logout()"><a href="#"> Logout</a></li>
          </ul>
        </div>

        <sp-authport></sp-authport>

      </div>
    `,
  providers: [HTTP_PROVIDERS, Stormpath],
  directives: [
    AuthPortComponent
  ]
})
export class AppComponent implements OnInit {
  private user$: Observable<Account | boolean>;
  private loggedIn$: Observable<boolean>;
  private login: boolean;
  private register: boolean;

  constructor(public stormpath: Stormpath) {

  }
  ngOnInit() {
    this.login = true;
    this.register = false;
    this.user$ = this.stormpath.user$;
    this.loggedIn$ = this.user$.map(user => !!user);
  }

  showLogin() {
    this.login = !(this.register = false);
    // this.flip(this.login, this.register);
  }

  showRegister() {
    this.register = !(this.login = false);
    // this.flip(this.register, this.login);
  }

  flip(a: boolean, b: boolean) {
    a = !(b = false);
  }

  logout() {
    this.stormpath.logout();
  }
}
