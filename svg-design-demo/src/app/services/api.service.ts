import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  PHP_API_SERVER = "http://localhost/5500";
	constructor(private httpClient: HttpClient) { }
	readUsers(): Observable<User[]>{
		return this.httpClient.get<User[]>(`${this.PHP_API_SERVER}/index.php`);
	}
	createUser(user: User): Observable<User>{
		return this.httpClient.post<User>(`${this.PHP_API_SERVER}/create_user.php`, user);
	}
	updateUser(user: User){
		return this.httpClient.put<User>(`${this.PHP_API_SERVER}/update_user.php`, user);
	}
	deleteUser(id: number){
		return this.httpClient.delete<User>(`${this.PHP_API_SERVER}/delete_user.php/?id=${id}`);
	}
}
