import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { User } from './user';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT'
    // 'Authorization': 'Bearer szdp79a2kz4wh4frjzuqu4sz6qeth8m3'
  })
};

@Injectable({
  providedIn: 'root'
})
export class UserLoginService {
  private baseUrl = "http://localhost:8080/api/user";
  userData!: User;

  constructor(private http: HttpClient) { }

  getUserLogin(user: User): Observable<User> {
    return this.http.post<User>(this.baseUrl + '/login', user, httpOptions)
      .pipe(catchError((err) => {
        console.log('error caught in service')
        console.error(err);
        alert("Error login ");

        //Handle the error here

        return throwError(err);    //Rethrow it back to component
      }));
  }

  registUser(user: User): Observable<any> {
    return this.http.post<any>(this.baseUrl + '/signup', user, httpOptions)
      .pipe(catchError((err) => {
        console.log('error caught in service')
        console.error(err);
        alert("signup error ");

        //Handle the error here

        return throwError(err);    //Rethrow it back to component
      }));
  }

  sendCode(user: User): Observable<any> {
    return this.http.post<any>(this.baseUrl + '/send', user, httpOptions)
      .pipe(catchError((err) => {
        console.log('error caught in service')
        console.error(err);
        alert("send mail error ");

        //Handle the error here

        return throwError(err);    //Rethrow it back to component
      }));
  }

  sendReset(user: User): Observable<any> {
    return this.http.post<any>(this.baseUrl + '/sendReset', user, httpOptions)
      .pipe(catchError((err) => {
        console.log('error caught in service')
        console.error(err);
        alert("send mail error ");

        //Handle the error here

        return throwError(err);    //Rethrow it back to component
      }));
  }

  resetPass(user: User): Observable<any> {
    return this.http.post<string>(this.baseUrl + '/resetPass', user, httpOptions)
      .pipe(catchError((err) => {
        console.error(err);
        alert("reset pasword error ");

        //Handle the error here

        return throwError(err);    //Rethrow it back to component
      }));
  }

  publishData(user: User) {
    this.userData = user;
    console.log(this.userData , 'publish');
  }

  getData() {
    console.log(this.userData , 'get');
    return this.userData ;
  }
}
