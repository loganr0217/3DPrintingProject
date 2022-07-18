import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
@Component({
  selector: 'app-stage5',
  templateUrl: './stage5.component.html',
  styleUrls: ['./stage5.component.css']
})
export class Stage5Component implements OnInit {

  constructor(private sharedDataService:SharedDataService) { }
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

  saveDesign():void {
    //
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

}
