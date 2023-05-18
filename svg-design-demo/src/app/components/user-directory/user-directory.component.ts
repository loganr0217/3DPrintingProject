import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { HttpClient } from '@angular/common/http';
import { outputAst } from '@angular/compiler';

@Component({
  selector: 'app-user-directory',
  templateUrl: './user-directory.component.html',
  styleUrls: ['./user-directory.component.css']
})
export class UserDirectoryComponent implements OnInit {
    userData:any;
    user:any;

    constructor(public sharedDataService:SharedDataService, private http:HttpClient) { }

    ngOnInit(): void {
      this.refreshUsers();
    }

    refreshUsers():void {
    this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/users").subscribe(result => {
      this.userData = JSON.parse(JSON.stringify(result));
    });
    }
    
    selectUser(user:any):void {
      user = this.userData;
    }

    filterUsers():void {
      //filter users info
    }

    displayUserData():void {
      //display user data in a chart
    }

    isAdmin(): boolean {
      if(this.sharedDataService.userInfo[5] == "admin") {return true;}
      else {return false;}
    }
}
