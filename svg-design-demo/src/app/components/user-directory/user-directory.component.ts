import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-directory',
  templateUrl: './user-directory.component.html',
  styleUrls: ['./user-directory.component.css']
})
export class UserDirectoryComponent implements OnInit {
    userData:any;
    user:any;
    userOrder:any;
    order:any;

    constructor(public sharedDataService:SharedDataService, private http:HttpClient) { }

    ngOnInit(): void {
      this.refreshUsers();
      this.refreshOrders();
    }

    refreshUsers():void {
      this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/users").subscribe(result => {
        this.userData = JSON.parse(JSON.stringify(result));
      });
    }

    refreshOrders():void {
      const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : "";
      const password:string = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[4] : "";
      this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/userorders?email='"+email+"'&password='"+password+ "'").subscribe(result => {
        this.userOrder = JSON.parse(JSON.stringify(result));
      });
    }
    
    selectUser(user:any):void {
      this.refreshOrders();
      this.order = this.userOrder;
      this.user = user;
      let counter:number = 0;
      let saveCounter:number = 0;
      (<HTMLInputElement>document.getElementById("signupInput"))!.value = this.user[5];
      for(let ord of this.userOrder)
      {
        if(ord[0] == this.user[0])
        {
          counter++;
          
          if(ord[18] == "saved")
            saveCounter++;
        }
      }
      (<HTMLInputElement>document.getElementById("orderInput"))!.value = String(counter);
      (<HTMLInputElement>document.getElementById("savedInput"))!.value = String(saveCounter);
    }

    filterUsers():string {
      this.refreshOrders();
      let data:any = this.userData;
      let orderInfo = this.userOrder;
      let order:number = Number((<HTMLInputElement>document.getElementById("orderInput"))?.value);
      let save:number = Number((<HTMLInputElement>document.getElementById("savedInput"))?.value);
      let sign:string = (<HTMLInputElement>document.getElementById("signupInput"))?.value;
      //orderInfo[18] = status -> saved or ordered
      //orderInfo[0] = id
      //orderInfo[1] = email
      return data;
    }

    displayUserData():string {
      this.refreshOrders();
      let data:any = this.userData;
      let counter:number = 0;
      let totalnum:number = this.userData.length;
      let orderInfo = this.userOrder;
      let order:number = Number((<HTMLInputElement>document.getElementById("orderInput"))?.value);
      let save:number = Number((<HTMLInputElement>document.getElementById("savedInput"))?.value);
      let sign:string = (<HTMLInputElement>document.getElementById("signupInput"))?.value;
      return data;
    }

    isAdmin(): boolean {
      if(this.sharedDataService.userInfo[5] == "admin") {return true;}
      else {return false;}
    }
}
