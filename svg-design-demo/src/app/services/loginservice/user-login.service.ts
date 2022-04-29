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

  constructor(private http: HttpClient) { }

  getUserLogin(user: User): Observable<User>{
    return this.http.post<User>(this.baseUrl+'/login', user, httpOptions)
    .pipe(catchError((err) => {
      console.log('error caught in service')
      console.error(err);

      //Handle the error here

      return throwError(err);    //Rethrow it back to component
    }));
  }

}
