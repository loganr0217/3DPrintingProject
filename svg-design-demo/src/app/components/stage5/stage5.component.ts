import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { Entry } from 'contentful';
import { ContentfulService } from 'src/app/services/contentful.service';

@Component({
  selector: 'app-stage5',
  templateUrl: './stage5.component.html',
  styleUrls: ['./stage5.component.css']
})
export class Stage5Component implements OnInit {
  posts:Entry<any>[] = [];
  howToPosts:Entry<any>[] = [];

  getWindowPrice():string {
    const totalWindowArea:number = this.sharedDataService.sampleOrder != "" ? (this.sharedDataService.sampleOrder == "coasters" ? (1) : (2)) : ((this.sharedDataService.windowWidth * this.sharedDataService.windowHeight) + (this.sharedDataService.bottomSashWidth * this.sharedDataService.bottomPanelHeight));
    if(totalWindowArea == 1 || totalWindowArea == 2) {return "Price (shipping not included): $29.00";}
    else {
      let costPerSqMM:number = 29 / 92903;
      let totalPrice:string = (totalWindowArea * costPerSqMM < 29 ? (29) : (totalWindowArea * costPerSqMM)).toFixed(2);
      return "Price (shipping not included): $" + totalPrice;
    }
  }

  constructor(public sharedDataService:SharedDataService, private http:HttpClient, public contentfulService:ContentfulService) { }
  getPanelWidth(top:boolean = true):string {
    let finalPanelWidth:number = top ? this.sharedDataService.topPanelWidth : this.sharedDataService.bottomPanelWidth;
    if(finalPanelWidth >= 100 && finalPanelWidth <= 386) {return (this.isDoubleHung() ? (top ? "Top Panel Width: " : "Bottom Panel Width: ") : "Panel Width: ") + this.convertBackNumber(finalPanelWidth, this.sharedDataService.unitChoice).toFixed(2) + " " + this.sharedDataService.unitChoice;}
    else {return "-1";}
  }

  getPanelHeight(top:boolean = true):string {
    let finalPanelHeight:number = top ? this.sharedDataService.topPanelHeight : this.sharedDataService.bottomPanelHeight;
    if(finalPanelHeight >= 100 && finalPanelHeight <= 386) {return (this.isDoubleHung() ? (top ? "Top Panel Height: " : "Bottom Panel Height: ") : "Panel Height: ") + this.convertBackNumber(finalPanelHeight, this.sharedDataService.unitChoice).toFixed(2) + " " + this.sharedDataService.unitChoice;}
    else {return "-1";}
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

  getWindowWidth():string {
    return (this.isDoubleHung() ? "Top Sash Width: " : "Window Width: ") + this.convertBackNumber(this.sharedDataService.windowWidth, this.sharedDataService.unitChoice).toFixed(2)  + " " + this.sharedDataService.unitChoice;
  }

  getWindowHeight():string {
    return (this.isDoubleHung() ? "Top Sash Height: " : "Window Height: ") + this.convertBackNumber(this.sharedDataService.windowHeight, this.sharedDataService.unitChoice).toFixed(2) + " " + this.sharedDataService.unitChoice;
  }

  getBottomSashWidth():string {
    return "Bottom Sash Width: " + this.convertBackNumber(this.sharedDataService.bottomSashWidth, this.sharedDataService.unitChoice).toFixed(2)  + " " + this.sharedDataService.unitChoice;
  }

  getBottomSashHeight():string {
    return "Bottom Sash Height: " + this.convertBackNumber(this.sharedDataService.bottomSashHeight, this.sharedDataService.unitChoice).toFixed(2)  + " " + this.sharedDataService.unitChoice;
  }

  ngOnInit(): void {
    this.contentfulService.getPosts('stage5').then(posts => this.posts = posts);
    this.contentfulService.getPostById('37OYCg9VJiW4ZHoxjqVHiZ', 'howTo').then(post => this.howToPosts.push(post));
  }

  goToStage4():void {
    document.getElementById("stage4")?.setAttribute("style", "visibility:visible;")
    document.getElementById("stage4")?.scrollIntoView({behavior: 'smooth'});
  }
  nextstageCheckout() {
    document.getElementById("checkoutStage")?.setAttribute("style", "visibility:visible;")
    document.getElementById("checkoutStage")?.scrollIntoView({behavior: 'smooth'});
  }

  // Method to check whether selected window shape is a 2xHung
  isDoubleHung():boolean {
    if(this.sharedDataService.selectedWindowShape.substring(0, 2) == "2x") {return true;}
    return false;
  }

  saveDesign():void {
    if(confirm("Are you sure you want to save this design?")) {
      // Setting up vars to get final info for order
      const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : null;
      const password:string = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[4] : "";
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

      const headers = { 'content-type': 'application/json'}  
      const body=JSON.stringify(
        {
          'panelColoringString':panelColoringString
        });

      // const streetAddress:string = (<HTMLInputElement>document.getElementById("streetAddressInput")).value;
      // const city:string = (<HTMLInputElement>document.getElementById("cityInput")).value;
      // const state:string = (<HTMLInputElement>document.getElementById("stateInput")).value;
      // const zipcode:string = (<HTMLInputElement>document.getElementById("zipcodeInput")).value;
      // const country:string = "US";
      const bottomWindowWidth:number = this.isDoubleHung() ? this.convertBackNumber(this.sharedDataService.bottomSashWidth, this.sharedDataService.unitChoice) : 0;
      const bottomWindowHeight:number = this.isDoubleHung() ? this.convertBackNumber(this.sharedDataService.bottomSashHeight, this.sharedDataService.unitChoice) : 0;
      const frameColor:string = this.sharedDataService.currentFilamentColor;

      // this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/saveorder?email='"+email
      // +"'&password='"+password+"'&selectedDividerType='"+selectedDividerType+"'&unitChoice='"+unitChoice
      // +"'&windowWidth="+windowWidth+"&windowHeight="+windowHeight+"&horzDividers="+horzDividers
      // +"&vertDividers="+vertDividers+"&dividerWidth="+dividerWidth
      // +"&templateID="+templateID+"&panelColoringString='"+panelColoringString
      // +"'&bottomWindowWidth="+bottomWindowWidth+
      // "&bottomWindowHeight="+bottomWindowHeight+"&frameColor='"+frameColor+"'").subscribe(result => alert("Success! Your order has been saved."));

      this.http.post("https://backend-dot-lightscreendotart.uk.r.appspot.com/saveorder?email='"+email
      +"'&password='"+password+"'&selectedDividerType='"+selectedDividerType+"'&unitChoice='"+unitChoice
      +"'&windowWidth="+windowWidth+"&windowHeight="+windowHeight+"&horzDividers="+horzDividers
      +"&vertDividers="+vertDividers+"&dividerWidth="+dividerWidth
      +"&templateID="+templateID+"&bottomWindowWidth="+bottomWindowWidth+
      "&bottomWindowHeight="+bottomWindowHeight+"&frameColor='"+frameColor+"'", body, {'headers':headers}).subscribe(result => alert("Success! Your order has been saved."));
    }
  }

}
