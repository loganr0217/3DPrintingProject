import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css']
})
export class CheckoutPageComponent implements OnInit {
  emailForm:UntypedFormGroup;
  userCouponCodes:any;
  selectedCouponCode:string = "";
  selectedCouponCodeIndex:number = -1;

  constructor(public sharedDataService:SharedDataService, private http:HttpClient, private formBuilder:UntypedFormBuilder,
    private router:Router) { }

  ngOnInit(): void {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : "";
    const password:string = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[4] : "";

    this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/getusercouponcodes?email='"+email+"'&password='"+password+ "'").subscribe(result => {
      this.userCouponCodes = JSON.parse(JSON.stringify(result));
    });
    

    this.initialize();
  }

  initialize() {
    var input = document.getElementById('searchTextField') as HTMLInputElement;
    new google.maps.places.Autocomplete(input);
  }

  get email() {
    return this.emailForm.get('email');
  }


  getPanelWidthHeight(width:number):number {
    if(width >= 100 && width <=500) {return width;}
    else {return width / (Math.ceil(width/500));}
  }

  convertNumber(num:number, unit:string):number {
    if(unit == "mm") {return num;}
    else if(unit == "inches") {return num*25.4;}
    else {return num*10;};
  }

  convertBackNumber(num:number, unit:string):number {
    if(unit == "mm") {return num;}
    else if(unit == "inches") {return num/25.4;}
    else {return num/10;};
  }

  // Method to check whether selected window shape is a 2xHung
  isDoubleHung():boolean {
    if(this.sharedDataService.selectedWindowShape.substring(0, 2) == "2x") {return true;}
    return false;
  }

  getFinalInfo():void {
    if(!this.sharedDataService.signedIn && this.email?.invalid) {alert("Make sure to enter your email."); return;}
    if(confirm('Are you sure you want to make this order?')) {
      let finalText:string[] = [String(this.convertNumber(this.sharedDataService.windowWidth / this.sharedDataService.panelLayoutDims[0], this.sharedDataService.unitChoice)),
      String(this.convertNumber(this.sharedDataService.windowHeight / this.sharedDataService.panelLayoutDims[1], this.sharedDataService.unitChoice))];
      let final:string = "[";
      for(let row:number = 0; row < this.sharedDataService.panelLayoutDims[1]; ++row) {
        for(let col:number = 0; col < this.sharedDataService.panelLayoutDims[0]; ++col) {
          //finalText.push(this.sharedDataService.svgTemplateData[this.sharedDataService.currentTemplateNumber][i].d);
          finalText.push(this.sharedDataService.panelLayout[row][col].getOptimizedD());
        }
      }
      for(let j:number = 0; j < finalText.length; ++j) {
        final += "'" + finalText[j] + "'";
        if(j != finalText.length-1) {final += ",";}
      }
      final += "]\n"
      final += this.sharedDataService.panelColoringArray;
      const streetAddress:string = (<HTMLInputElement>document.getElementById("searchTextField")).value;
      // if(streetAddress == "") {
      //   alert("Make sure to enter an address.");
      //   return;
      // }
      if(streetAddress != "" && ( ((this.sharedDataService.userInfo[5] != undefined && (this.sharedDataService.userInfo[5].includes('admin')))) || this.isValidCouponCode(this.selectedCouponCodeIndex) )) {
        // Setting up vars to get final info for order
        const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : (<HTMLInputElement>document.getElementById("emailInput")).value;
        const selectedDividerType:string = this.sharedDataService.selectedDividerType;
        const unitChoice:string = this.sharedDataService.unitChoice;
        const windowWidth:number = this.convertBackNumber(this.sharedDataService.windowWidth, this.sharedDataService.unitChoice);
        const windowHeight:number = this.convertBackNumber(this.sharedDataService.windowHeight, this.sharedDataService.unitChoice);
        const horzDividers:number = this.sharedDataService.dividerNumbers[0];
        const vertDividers:number = this.sharedDataService.dividerNumbers[1];
        const dividerWidth:number = this.convertBackNumber(this.sharedDataService.dividerWidth, this.sharedDataService.unitChoice);
        const templateID:number = this.sharedDataService.selectedTemplateID;
        let panelColoringString:string = "";
        for(let i:number = 0; i < this.sharedDataService.panelColoringArray.length; ++i) {
          panelColoringString += this.sharedDataService.panelColoringArray[i].join(",");
          if(i != this.sharedDataService.panelColoringArray.length - 1) {panelColoringString += ";";}
        }

        
        // const city:string = (<HTMLInputElement>document.getElementById("cityInput")).value;
        // const state:string = (<HTMLInputElement>document.getElementById("stateInput")).value;
        // const zipcode:string = (<HTMLInputElement>document.getElementById("zipcodeInput")).value;
        // const country:string = "US";
        const bottomWindowWidth:number = this.isDoubleHung() ? this.convertBackNumber(this.sharedDataService.bottomSashWidth, this.sharedDataService.unitChoice) : 0;
        const bottomWindowHeight:number = this.isDoubleHung() ? this.convertBackNumber(this.sharedDataService.bottomSashHeight, this.sharedDataService.unitChoice) : 0;
        const frameColor:string = this.sharedDataService.currentFilamentColor;
        const totalWindowArea:number = this.sharedDataService.sampleOrder != "" ? (this.sharedDataService.sampleOrder == "coasters" ? (1) : (2)) : ((this.sharedDataService.windowWidth * this.sharedDataService.windowHeight) + (this.sharedDataService.bottomSashWidth * this.sharedDataService.bottomPanelHeight)); 
        if(this.selectedCouponCodeIndex == -1 && (this.sharedDataService.userInfo[5] != undefined && (this.sharedDataService.userInfo[5].includes('admin')))) {this.selectedCouponCode = "stripe"};
        window.open(("https://backend-dot-lightscreendotart.uk.r.appspot.com/makeorder?email='"+email
        +"'&selectedDividerType='"+selectedDividerType+"'&unitChoice='"+unitChoice
        +"'&windowWidth="+windowWidth+"&windowHeight="+windowHeight+"&horzDividers="+horzDividers
        +"&vertDividers="+vertDividers+"&dividerWidth="+dividerWidth
        +"&templateID="+templateID+"&panelColoringString='"+panelColoringString
        +"'&streetAddress='"+streetAddress+"'&bottomWindowWidth="+bottomWindowWidth+
        "&bottomWindowHeight="+bottomWindowHeight+"&frameColor='"+frameColor+"'"+"&couponCode="+this.selectedCouponCode+"&totalArea="+totalWindowArea), '_blank')!.focus();
       
        // this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/makeorder?email='"+email
        // +"'&selectedDividerType='"+selectedDividerType+"'&unitChoice='"+unitChoice
        // +"'&windowWidth="+windowWidth+"&windowHeight="+windowHeight+"&horzDividers="+horzDividers
        // +"&vertDividers="+vertDividers+"&dividerWidth="+dividerWidth
        // +"&templateID="+templateID+"&panelColoringString='"+panelColoringString
        // +"'&streetAddress='"+streetAddress+"'&bottomWindowWidth="+bottomWindowWidth+
        // "&bottomWindowHeight="+bottomWindowHeight+"&frameColor='"+frameColor+"'"+"&couponCode="+this.selectedCouponCode+"&totalArea="+totalWindowArea).subscribe(result => {
        //   window.location.href = result.toString();
        //   // let test = JSON.parse(JSON.stringify(result));
        //   // if(test[0] == 1) {alert("Success! Your order has been placed.");}
        //   // else if(test[0] == -2) {alert("This code is invalid.");}
        //   // else {alert("Something went wrong when placing the order.");}
        // });
      }
      else {
        alert("Make sure to enter your coupon code as well as your shipping information.");
      }
    }
    
  }

  selectCouponCode(code:string, index:number):void {
    this.selectedCouponCode = code;
    this.selectedCouponCodeIndex = index;
    (<HTMLInputElement>document.getElementById("couponCodeInput")).value = this.selectedCouponCode;
  }

  isValidCouponCode(index:number):boolean {
    // Hasn't been used yet
    if(this.userCouponCodes[index][3] == undefined) {
      let totalWindowArea:number = (this.sharedDataService.windowWidth * this.sharedDataService.windowHeight) + (this.sharedDataService.bottomSashWidth * this.sharedDataService.bottomPanelHeight); 
      if(this.sharedDataService.sampleOrder == "coasters" && this.userCouponCodes[index][1].toString().includes("coasters_")) {return true;}
      else if(this.sharedDataService.sampleOrder == "lightcatcher" && this.userCouponCodes[index][1].toString().includes("lightcatcher_")) {return true;}
      else if(this.sharedDataService.sampleOrder == "") {
        let numberStart:number = Number(this.userCouponCodes[index][1].substring(0, this.userCouponCodes[index][1].indexOf("sq")));
        let maxSize:number = (numberStart*12*25.4)*(numberStart*12*25.4);
        if(totalWindowArea <= maxSize) {return true;}
        else {return false;}
      }
      else {return false;}
    }
    return false;
  }

  previousStage():void {
    --this.sharedDataService.currentStepID;
    document.getElementById("stage5")?.setAttribute("style", "visibility:visible;")
    document.getElementById("stage5")?.scrollIntoView({behavior: 'smooth'});
  }

}