import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { SVGTemplate } from '../svgScaler';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent implements OnInit {
  userOrders:any;
  adminFilter:boolean = false;
  order:any;

  constructor(public sharedDataService:SharedDataService, private http:HttpClient) { }

  ngOnInit(): void {
    const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : "";
    const password:string = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[4] : "";
    this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/userorders?email='"+email+"'&password='"+password+ "'").subscribe(result => {
      this.userOrders = JSON.parse(JSON.stringify(result));
    });

  }

  addCouponCode():void {
    if((<HTMLInputElement>document.getElementById("kickstarterCodeInput")).value != "") {
      const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : "";
      const password:string = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[4] : "";
      this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/addusercouponcode?email='"+email+"'&password='"+password+ "'&couponCode=" + (<HTMLInputElement>document.getElementById("kickstarterCodeInput")).value.toString()).subscribe(result => {
        let test = JSON.stringify(result).split('[').join("").split(']').join("").split('"').join("").split(",");
        if(test.length > 1) {
          alert("Success! Your coupon code has been added to your account.");
          (<HTMLInputElement>document.getElementById("kickstarterCodeInput")).value = "";
        }
        else if(test[0] == "-3") {alert("This code is invalid.");}
        else {alert("Something went wrong.");}
      });
    }
    
  }

}
