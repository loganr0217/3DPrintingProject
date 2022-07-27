import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
@Component({
  selector: 'app-stage5',
  templateUrl: './stage5.component.html',
  styleUrls: ['./stage5.component.css']
})
export class Stage5Component implements OnInit {

  constructor(private sharedDataService:SharedDataService, private http:HttpClient) { }
  getPanelWidth(top:boolean = true):string {
    let width:number = top ? this.sharedDataService.windowWidth : this.sharedDataService.bottomSashWidth;
    let vertDividers:number = this.sharedDataService.dividerNumbers[1] ? this.sharedDataService.dividerNumbers[1] : 0;
    let finalPanelWidth:number = 0; 
    if(this.sharedDataService.selectedDividerType == 'nodiv') {
      if(width >= 100 && width <=500) {finalPanelWidth = width;}
      else {finalPanelWidth = width / (Math.ceil(width/500));}
    }
    else if(this.sharedDataService.selectedDividerType == 'embeddeddiv') {
      // // Spacing using user's dividers is bigger than 500
      // if(((width - (vertDividers*this.sharedDataService.dividerWidth)) / (vertDividers+1)) + 
      // ((vertDividers/(vertDividers+1)) * this.sharedDataService.dividerWidth) > 500) {
      //     finalPanelWidth = ((width - (vertDividers*this.sharedDataService.dividerWidth)) / (vertDividers+1)) + 
      //     ((vertDividers/(vertDividers+1)) * this.sharedDataService.dividerWidth) / Math.ceil((((width - (vertDividers*this.sharedDataService.dividerWidth)) / (vertDividers+1)) + 
      //       ((vertDividers/(vertDividers+1)) * this.sharedDataService.dividerWidth)) / 500);
      // }
      // // Spacing using user's dividers is >= 100 and <= 500 (perfect)
      // else if(((width - (vertDividers*this.sharedDataService.dividerWidth)) / (vertDividers+1)) + 
      // ((vertDividers/(vertDividers+1)) * this.sharedDataService.dividerWidth) >= 100) {
      //     finalPanelWidth = (((width - (vertDividers*this.sharedDataService.dividerWidth)) / (vertDividers+1)) + 
      //       ((vertDividers/(vertDividers+1)) * this.sharedDataService.dividerWidth));
      // }
      // // Spacing is too small (have to ignore dividers)
      // else {
      //   if(width >= 100 && width <=500) {finalPanelWidth = width;}
      //   else {finalPanelWidth = width / (Math.ceil(width/500));}
      // }
      finalPanelWidth = width / (vertDividers+1);
      
    }
    // raised divs
    else {
      finalPanelWidth = ((width - (vertDividers*this.sharedDataService.dividerWidth)) / (vertDividers+1));
    }
    // Fixing panel height to be under 500
    if(finalPanelWidth >= 500) {finalPanelWidth = finalPanelWidth / (Math.ceil(finalPanelWidth/500));}

    if(finalPanelWidth >= 100 && finalPanelWidth <= 500) {return (this.isDoubleHung() ? (top ? "Top Panel Width: " : "Bottom Panel Width: ") : "Panel Width: ") + this.convertBackNumber(finalPanelWidth, this.sharedDataService.unitChoice).toFixed(2) + this.sharedDataService.unitChoice;}
    else {return "-1";}
  }

  getPanelHeight(top:boolean = true):string {
    let height:number = top ? this.sharedDataService.windowHeight : this.sharedDataService.bottomSashHeight;
    let horzDividers:number = this.sharedDataService.dividerNumbers[0];
    let finalPanelHeight:number = 0; 
    if(this.sharedDataService.selectedDividerType == 'nodiv') {
      if(height >= 100 && height <=500) {finalPanelHeight = height;}
      else {finalPanelHeight = height / (Math.ceil(height/500));}
    }
    else if(this.sharedDataService.selectedDividerType == 'embeddeddiv') {
      // // Spacing using user's dividers is bigger than 500
      // if(((height - (horzDividers*this.sharedDataService.dividerWidth)) / (horzDividers+1)) + 
      // ((horzDividers/(horzDividers+1))*this.sharedDataService.dividerWidth) > 500) {
      //     finalPanelHeight = ((height - (horzDividers*this.sharedDataService.dividerWidth)) / (horzDividers+1)) + 
      //     ((horzDividers/(horzDividers+1))*this.sharedDataService.dividerWidth) / Math.ceil((((height - (horzDividers*this.sharedDataService.dividerWidth)) / (horzDividers+1)) + 
      //       ((horzDividers/(horzDividers+1))*this.sharedDataService.dividerWidth)) / 500);
      // }
      // // Spacing using user's dividers is >= 100 and <= 500 (perfect)
      // else if(((height - (horzDividers*this.sharedDataService.dividerWidth)) / (horzDividers+1)) + 
      // ((horzDividers/(horzDividers+1))*this.sharedDataService.dividerWidth) >= 100) {
      //     finalPanelHeight = (((height - (horzDividers*this.sharedDataService.dividerWidth)) / (horzDividers+1)) + 
      //       ((horzDividers/(horzDividers+1))*this.sharedDataService.dividerWidth));
      // }
      // // Spacing is too small (have to ignore dividers)
      // else {
      //   if(height >= 100 && height <=500) {finalPanelHeight = height;}
      //   else {finalPanelHeight = height / (Math.ceil(height/500));}
      // }
      finalPanelHeight = height / (horzDividers+1);
      
    }
    // raised divs
    else {
      finalPanelHeight = ((height - (horzDividers*this.sharedDataService.dividerWidth)) / (horzDividers+1));
    }
    // Fixing panel height to be under 500
    if(finalPanelHeight >= 500) {finalPanelHeight = finalPanelHeight / (Math.ceil(finalPanelHeight/500));}

    if(finalPanelHeight >= 100 && finalPanelHeight <= 500) {return (this.isDoubleHung() ? (top ? "Top Panel Height: " : "Bottom Panel Height: ") : "Panel Height: ") + this.convertBackNumber(finalPanelHeight, this.sharedDataService.unitChoice).toFixed(2) + this.sharedDataService.unitChoice;}
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
    return (this.isDoubleHung() ? "Top Sash Width: " : "Window Width: ") + this.convertBackNumber(this.sharedDataService.windowWidth, this.sharedDataService.unitChoice).toFixed(2)  + this.sharedDataService.unitChoice;
  }

  getWindowHeight():string {
    return (this.isDoubleHung() ? "Top Sash Height: " : "Window Height: ") + this.convertBackNumber(this.sharedDataService.windowHeight, this.sharedDataService.unitChoice).toFixed(2) + this.sharedDataService.unitChoice;
  }

  getBottomSashWidth():string {
    return "Bottom Sash Width: " + this.convertBackNumber(this.sharedDataService.bottomSashWidth, this.sharedDataService.unitChoice).toFixed(2)  + this.sharedDataService.unitChoice;
  }

  getBottomSashHeight():string {
    return "Bottom Sash Height: " + this.convertBackNumber(this.sharedDataService.bottomSashHeight, this.sharedDataService.unitChoice).toFixed(2)  + this.sharedDataService.unitChoice;
  }

  ngOnInit(): void {
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
    // console.log(panelColoringString);
    const streetAddress:string = (<HTMLInputElement>document.getElementById("streetAddressInput")).value;
    const city:string = (<HTMLInputElement>document.getElementById("cityInput")).value;
    const state:string = (<HTMLInputElement>document.getElementById("stateInput")).value;
    const zipcode:string = (<HTMLInputElement>document.getElementById("zipcodeInput")).value;
    const country:string = "US";
    const bottomWindowWidth:number = this.isDoubleHung() ? this.convertBackNumber(this.sharedDataService.bottomSashWidth, this.sharedDataService.unitChoice) : 0;
    const bottomWindowHeight:number = this.isDoubleHung() ? this.convertBackNumber(this.sharedDataService.bottomSashHeight, this.sharedDataService.unitChoice) : 0;
    // console.log(streetAddress + " " + city + " " + state);
    this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/saveorder?email='"+email
    +"'&password='"+password+"'&selectedDividerType='"+selectedDividerType+"'&unitChoice='"+unitChoice
    +"'&windowWidth="+windowWidth+"&windowHeight="+windowHeight+"&horzDividers="+horzDividers
    +"&vertDividers="+vertDividers+"&dividerWidth="+dividerWidth
    +"&templateID="+templateID+"&panelColoringString='"+panelColoringString
    +"'&streetAddress='"+streetAddress+"'&city='"+city+"'&state='"+state
    +"'&zipcode='"+zipcode+"'&country='"+country+"'&bottomWindowWidth="+bottomWindowWidth+
    "&bottomWindowHeight="+bottomWindowHeight).subscribe(result => alert("Success! Your order has been placed."));
  }

}
