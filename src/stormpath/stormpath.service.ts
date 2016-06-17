import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import { Location } from '@angular/common';

import { ReplaySubject } from 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/observable/throw';

import { Account, BaseStormpathAccount } from '../shared/account';

let APPLICATION_JSON = 'application/json';

class JsonGetOptions extends RequestOptions {
  constructor() {
    super({
      headers: new Headers({ 'Accept': APPLICATION_JSON })
    });
  }
}

class JsonPostOptions extends JsonGetOptions {
  constructor() {
    super();
    this.headers.append('Content-Type', APPLICATION_JSON);
  }
}

class AuthenticatedJsonRequest extends JsonGetOptions {
  constructor(accessToken: string) {
    super();
    this.headers.append('Authorization', 'Bearer ' + accessToken);
  }
}

class OAuthTokenPostOptions extends RequestOptions {
  constructor() {
    super({
      headers: new Headers({
        'Accept': APPLICATION_JSON,
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    });
  }
}

export function defaultSpTokenResolver(location: Location): string {
  let m = location.path().match(/sptoken=([^&]+)/);
  return m && m.length === 2 ? m[1] : '';
}

export interface RegistrationFormModel {
  email?: string;
  surname?: string;
  givenName?: string;
  password?: string;
  [propName: string]: any;
}

export interface ForgotPasswordFormModel {
  email: string;
  accountStore?: Object;
  organizationNameKey?: string;
}

export interface ResendEmailVerificationRequest {
  login: string;
  accountStore?: Object;
  organizationNameKey?: string;
}

export interface PasswordResetRequest {
  accountStore?: Object;
  organizationNameKey?: string;
  password: string;
  sptoken: string;
}


export interface LoginFormModel {
  login: string;
  password: string;
  accountStore?: Object;
  organizationNameKey?: string;
}

export interface StormpathErrorResponse {
  status: number;
  message: string;
}

export class LoginService {
  public forgot: boolean;
  public login: boolean;
  public register: boolean;
  constructor() {
    this.forgot = false;
    this.login = true;
    this.register = false;
  }
  forgotPassword() {
    this.forgot = true;
    this.login = false;
  }
}


@Injectable()
export class Stormpath {

  appId: string;
  baseUrl: string;
  user$: Observable<Account | boolean>;
  private accessToken: string = '';
  private refreshToken: string = '';
  private userSource: ReplaySubject<Account | boolean>;


  constructor(public http: Http ) {

    this.appId = '';
    this.baseUrl = '';
    this.userSource = new ReplaySubject<Account>(1);
    this.user$ = this.userSource.asObservable();
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
    // this.getAccount()
    //   .subscribe(user => this.userSource.next(user));
  }

  /**
   * Attempts to get the current user by making a request of the /me endpoint.
   *
   * @return {Observable<Account>}
   * An observable that will return an Account if the user is logged in, or null
   * if the user is not logged in.
   */
  getAccount(): Observable<Account> {
    let observable = this.http.get(
        this.buildUrl('/me'),
        this.appId ?
          new AuthenticatedJsonRequest(this.accessToken) :
            new JsonGetOptions()
       )
      .map(this.jsonParser)
      .map(this.accountTransformer)
      .catch((error: any) => {
        if (error.status && error.status === 401) {
          return Observable.of(false);
        }
        if (error.status && error.status === 404) {
          return Observable.throw(new Error('/me endpoint not found, please check server configuration.'));
        }
        return Observable.throw(error);
      });
    observable.subscribe(user => this.userSource.next(user));
    return observable;
  }

  getRegistrationViewModel() {
    return this.http.get(this.buildUrl('/register'), new JsonGetOptions())
      .map(this.jsonParser)
      .catch(this.errorTranslator);
  }

  /**
   * Attempts to register a new account by making a POST request to the
   * /register endpoint.
   *
   * @return {Observable<Account>}
   * An observable that will return an Account if the POST was successful.
   */
  register(form: Object): Observable<Account> {
    let observable = this.http.post(this.buildUrl('/register'), JSON.stringify(form), new JsonPostOptions())
      .map(this.jsonParser)
      .map(this.accountTransformer)
      .catch(this.errorTranslator)
      .share();
    return observable;
  }

  login(form: LoginFormModel) {
    if (this.appId) {

      let data = 'grant_type=password&username=' + form.login + '&password=' + form.password;

      let observable = this.http.post(this.buildUrl('/oauth/token'), data, new OAuthTokenPostOptions())
        .map(this.jsonParser)
        .map(this.accessTokenParser)
        .map(this.accountTransformer)
        .catch(this.errorTranslator)
        .share();

      observable.subscribe(user => this.userSource.next(user), () => { });
      return observable;
    } else {

      let observable = this.http.post(this.buildUrl('/login'), JSON.stringify(form), new JsonPostOptions())
        .map(this.jsonParser)
        .map(this.accountTransformer)
        .catch(this.errorTranslator)
        .share();

      observable.subscribe(user => this.userSource.next(user), () => { });
      return observable;
    }
  }

  logout() {
    this.refreshToken = this.accessToken = '';
    localStorage.setItem('accessToken', '');
    localStorage.setItem('refreshToken', '');
    this.http.post(this.buildUrl('/logout'), null, new JsonGetOptions())
      .catch(this.errorThrower)
      .subscribe(() => this.userSource.next(false));
  }


  resendVerificationEmail(request: ResendEmailVerificationRequest) {
    return this.http.post(this.buildUrl('/verify'), JSON.stringify(request), new JsonPostOptions())
      .map(this.jsonParser)
      .catch(this.errorTranslator);
  }

  sendPasswordResetEmail(form: ForgotPasswordFormModel) {
    return this.http.post(this.buildUrl('/forgot'), JSON.stringify(form), new JsonPostOptions())
      .map(this.jsonParser)
      .catch(this.errorTranslator);
  }

  resetPassword(form: PasswordResetRequest) {
    return this.http.post(this.buildUrl('/change'), JSON.stringify(form), new JsonPostOptions())
      .map(this.jsonParser)
      .catch(this.errorTranslator);
  }

  verifyEmailVerificationToken(sptoken: string) {
    return this.http.get(this.buildUrl('/verify?sptoken=' + sptoken), new JsonGetOptions())
      .map(this.jsonParser)
      .catch(this.errorTranslator);
  }

  verifyPasswordResetToken(sptoken: string) {
    return this.http.get(this.buildUrl('/change?sptoken=' + sptoken), new JsonGetOptions())
      .map(this.jsonParser)
      .catch(this.errorTranslator);
  }

  private buildAppUrl(): string {
    return this.baseUrl + '/client/v1/' + this.appId;
  }

  private buildUrl(suffix: string): string {
    return (this.appId ? this.buildAppUrl() : '') + suffix;
  }

  /**
   * Returns the JSON error from an HTTP response, or a generic error if the
   * response is not a JSON error
   * @param {any} error
   */
  private errorTranslator(error: any) {
    let errorObject: StormpathErrorResponse;
    try {
      errorObject = error.json();
    } catch (e) {
      console.error(error);
    }
    if (!errorObject || !errorObject.message) {
      errorObject = { message: 'Server Error', status: 0 };
    }
    return Observable.throw(errorObject);
  }

  private errorThrower(error: any) {
    return Observable.throw(error);
  }

  private accountTransformer(json: any) {
    if (json && json.account) {
      return new Account(json.account as BaseStormpathAccount);
    } else {
      Observable.throw(new Error('expected an account response'));
    }
  }

  private jsonParser(res: Response) {
    if (res.text() === '') {
      return null;
    }
    try {
      return res.json();
    } catch (e) {
      throw new Error('Response was not JSON, check your server configuration');
    }
  }

  private accessTokenParser(json: any) {
    console.log(json);

    this.accessToken = json.access_token;
    this.refreshToken = json.refresh_token;
    localStorage.setItem('accessToken', this.accessToken);
    localStorage.setItem('refreshToken', this.refreshToken);
    return json;
  }
}
