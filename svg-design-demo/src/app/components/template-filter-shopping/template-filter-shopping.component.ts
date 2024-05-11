import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';

declare var $:any;

@Component({
  selector: 'app-template-filter-shopping',
  templateUrl: './template-filter-shopping.component.html',
  styleUrls: ['./template-filter-shopping.component.css']
})
export class TemplateFilterShoppingComponent {
  // stage2Visible:boolean = true;
  // stage3Visible:boolean = false;
  // templateSectionVisible:boolean = false;
  selectedPalleteID:number = -1;
  selectedPalleteColors:string = '';

  constructor(public sharedDataService:SharedDataService, private http:HttpClient) { }

  ngOnInit():void {
    this.selectedPalleteColors = 'd4ce67,ea924a,c9942e,F1ABB9,d8b5bc';
    this.selectedPalleteID = 106;
    this.sharedDataService.selectedPalleteID = this.selectedPalleteID;
    this.sharedDataService.selectedPalleteColors = this.selectedPalleteColors.split(',');
    this.sharedDataService.selectedPalleteCategory = "Pasteles";
    this.sharedDataService.selectedTemplateCategory = "Art Deco";
  }

  changeStage2Visibility():void {this.sharedDataService.stage2Visible = !this.sharedDataService.stage2Visible;}
  changeStage3Visibility():void {this.sharedDataService.stage3Visible = !this.sharedDataService.stage3Visible;}
  changeTemplateSectionVisibility():void {this.sharedDataService.templateSectionVisible = !this.sharedDataService.templateSectionVisible;}

  updateSelectedPalleteCategory(palleteCategory:string):void {this.sharedDataService.selectedPalleteCategory = palleteCategory;}
  updateSelectedPallete(palleteID:number):void {this.selectedPalleteID = palleteID; this.sharedDataService.selectedPalleteID = palleteID;}

  updateSelectedTemplateCategories():void {
    let templateCategories:string = "";
    for(const tempCategory of ['Artist Inspired', 'Interests', 'Garden', 'Classics', 'Sacred', 'Abstract', 'Art Deco', 'Mid Century Modern', 'Geometric', 'Traditional', 'Specialty']) {
      if((<HTMLInputElement>document.getElementById("check_"+tempCategory))?.checked) {
        templateCategories += tempCategory + ";";
      }
    }
    this.sharedDataService.selectedTemplateCategory = templateCategories;
  }

  updatePalleteCategories():void {
    let palleteCategories:string = "";
    for(const palleteCategory of ['Pasteles', 'Natural', 'Moody', 'Monochrome', 'Vivid', 'Seasonal']) {
      if((<HTMLInputElement>document.getElementById("check_"+palleteCategory))?.checked) {
        palleteCategories += palleteCategory + ";";
      }
    }
    this.sharedDataService.selectedPalleteCategory = palleteCategories;
  }

  // Fills selected panel for a pane if autofill string exists
  updateColorArray(palleteColors:string):void {
      let panelNumber:number = 0;
      for(let row of this.sharedDataService.panelLayout) {
        for(let svgTemplate of row) {
          let autoStringPossibilities:string[] = [];
          for(let i:number = 0; i < svgTemplate.autofillString.length; ++i) {
            if(autoStringPossibilities.indexOf(svgTemplate.autofillString[i]) == -1) {autoStringPossibilities.push(svgTemplate.autofillString[i]);}
          }
          autoStringPossibilities.sort();
          
          // alert(splitAutofillString);
          for(let i:number = 0; i < svgTemplate.autofillString.length; ++i) {
              this.sharedDataService.panelColoringArray[panelNumber][i] = this.sharedDataService.selectedPalleteColors[autoStringPossibilities.indexOf(svgTemplate.autofillString[i])];
          }
          ++panelNumber;
        }
      }
    
  }

  getPalleteColorD(colors:string, colorIndex:number):string {
    let separatedColors:string[] = colors.split(",");
    let splitNumber:number = 300 / separatedColors.length;
    let paneString:string = "M " + colorIndex*splitNumber + ", 0 V 300 H " + (colorIndex+1)*splitNumber + "V 0 Z";
    return paneString;
  }

  updateCurrentColors(directionRight:boolean) {
    let currentColors:string[] = this.selectedPalleteColors.split(",");

    // Rotating colors in accordance with arrow clicked
    if(directionRight) {currentColors.unshift(currentColors.pop()!);}
    else {currentColors.push(currentColors.shift()!);}

    this.selectedPalleteColors = currentColors.join(",");
    this.sharedDataService.selectedPalleteColors = currentColors;
  }

  updatePalleteColors(palleteColors:string):void {
    this.selectedPalleteColors = palleteColors;
    this.sharedDataService.selectedPalleteColors = palleteColors.split(',');
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

  getWindowPrice():string {
    const totalWindowArea:number = this.sharedDataService.sampleOrder != "" ? (this.sharedDataService.sampleOrder == "coasters" ? (1) : (2)) : ((this.sharedDataService.windowWidth * this.sharedDataService.windowHeight) + (this.sharedDataService.bottomSashWidth * this.sharedDataService.bottomPanelHeight));
    if(totalWindowArea == 1 || totalWindowArea == 2) {return "$29.00";}
    else {
      let costPerSqMM:number = 29 / 92903;
      let totalPrice:string = (totalWindowArea * costPerSqMM < 29 ? (29) : (totalWindowArea * costPerSqMM)).toFixed(2);
      return "$" + totalPrice;
    }
  }

  addCartItem():void {
    ++this.sharedDataService.cartItems;

    // Collecting all the order info
    const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : null;
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
    const bottomWindowWidth:number = this.isDoubleHung() ? this.convertBackNumber(this.sharedDataService.bottomSashWidth, this.sharedDataService.unitChoice) : 0;
    const bottomWindowHeight:number = this.isDoubleHung() ? this.convertBackNumber(this.sharedDataService.bottomSashHeight, this.sharedDataService.unitChoice) : 0;
    const frameColor:string = this.sharedDataService.currentFilamentColor;


    let currentOrder:any = [this.sharedDataService.cartItems, email, selectedDividerType, unitChoice, windowWidth, windowHeight, horzDividers, vertDividers, dividerWidth, templateID, panelColoringString, 0, 0, 0, 0, 0, bottomWindowWidth, bottomWindowHeight, 0, 0, 0, 0, frameColor, this.getWindowPrice()];
    this.sharedDataService.shoppingCart.push(currentOrder);
    localStorage.setItem('shoppingCart', JSON.stringify(this.sharedDataService.shoppingCart));
    $('#customLightscreenModal').modal('hide');
  }

}
