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

  getStageVisibility(stage:string) {
    let finalResult:string = "";
    switch(stage) {
      case("landingPage"): {
        if(this.sharedDataService.continueSavedOrder) {finalResult = "visibility: hidden; display: none;";}
        break;
      }
      case("stage4"):
      case("stage5"):
      case("checkout"): {
        if(this.sharedDataService.selectedTemplateID == -1) {finalResult = "visibility: hidden; display: none;";}
        break;
      }

      // case("stage2"):
      // case("stage3"): {
      //   if(this.sharedDataService.selectedWindowShape == "unselected" || this.sharedDataService.continueSavedOrder) {finalResult = "visibility: hidden; display: none;";}
      //   break;
      // }
      // case("templateCategory"): {
      //   if(this.sharedDataService.continueSavedOrder) {finalResult = "visibility: hidden; display: none;";}
      //   break;
      // }
      
    }
    return finalResult;
  }

  ngOnInit(): void {
  }

}
