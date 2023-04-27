import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-coupon-code-generation-page',
  templateUrl: './coupon-code-generation-page.component.html',
  styleUrls: ['./coupon-code-generation-page.component.css']
})
export class CouponCodeGenerationPageComponent {
  currentCouponCode:string;

  constructor(private http:HttpClient, private sharedDataService:SharedDataService) { }

  ngOnInit(): void {
    this.currentCouponCode = "";
  }

  generateCouponCode():void {
    let codePrefix:string = "";
    var elems = document.getElementsByName("couponRadio");
    for(let i:number = 0; i < elems.length; ++i) {
      if((<HTMLInputElement>elems[i]).checked) {
        codePrefix = (<HTMLInputElement>elems[i]).value;
      }
    }

    if(codePrefix != "") {
      const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : "";
      const password:string = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[4] : "";

      this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/generatecouponcode?email='"+email+"'&password='"+password+ "'&codePrefix=" + codePrefix).subscribe(result => {
        let test = JSON.stringify(result).split('[').join("").split(']').join("").split('"').join("").split(",");
        alert(test);
        this.currentCouponCode = test[1];
      });
    }
  }


}
