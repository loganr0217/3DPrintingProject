import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { User } from 'src/app/models/user';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {
  //users:User[];
  constructor(public sharedDataService:SharedDataService) {
    // this.apiService.readUsers().subscribe((users: User[])=>{
    //   this.users = users;
    // }) 
  }

  ngOnInit(): void {
  }

}
