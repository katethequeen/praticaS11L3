import { iAccessData } from './../interfaces/i-access-data';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment.development';
import { BehaviorSubject, map, tap } from 'rxjs';
import { iUser } from '../interfaces/i-user';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { iLoginRequest } from '../interfaces/i-login-request';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  jwtHelper: JwtHelperService = new JwtHelperService();

  registerUrl: string = environment.registerUrl;
  loginUrl: string = environment.loginUrl;

  authSubject$ = new BehaviorSubject<iAccessData | null>(null);

  user$ = this.authSubject$
    .asObservable()
    .pipe(map((accessData) => accessData?.user));

  isLoggedIn$ = this.authSubject$.pipe(map((accessData) => !!accessData));

  autoLogoutTimer: any;

  constructor(private http: HttpClient, private router: Router) {}

  register(newUser: Partial<iUser>) {
    return this.http.post<iAccessData>(this.registerUrl, newUser);
  }

  login(authData: iLoginRequest) {
    return this.http.post<iAccessData>(this.loginUrl, authData).pipe(
      tap((accessData) => {
        this.authSubject$.next(accessData);
        localStorage.setItem('accessData', JSON.stringify(accessData));

        //Recupero data scadenza del TOKEN
        const expDate = this.jwtHelper.getTokenExpirationDate(
          accessData.accessToken
        ) as Date;

        //Avvio Logout automatico

        this.autoLogout(expDate);
      })
    );
  }

  logout() {
    this.authSubject$.next(null);
    localStorage.removeItem('accessData');
    this.router.navigate(['/auth/login']);
  }

  autoLogout(expDate: Date) {
    // clearTimeout(this.autoLogoutTimer);
    const expMs = expDate.getTime() - new Date().getTime();

    this.autoLogoutTimer = setTimeout(() => {
      this.logout();
    }, expMs);
  }

  restoreUser() {
    const userJSON: string | null = localStorage.getItem('accessData');
    if (!userJSON) return;

    const accessData: iAccessData = JSON.parse(userJSON);

    if (this.jwtHelper.isTokenExpired(accessData.accessToken)) {
      localStorage.removeItem('accessData');
      return;
    }

    this.authSubject$.next(accessData);
  }
}
