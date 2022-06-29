import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
@Component({
  selector: 'app-stage5',
  templateUrl: './stage5.component.html',
  styleUrls: ['./stage5.component.css']
})
export class Stage5Component implements OnInit {

  constructor(private sharedDataService:SharedDataService) { }
  getPanelWidth():string {
    let width:number = this.sharedDataService.windowWidth;
    let vertDividers:number = this.sharedDataService.dividerNumbers[1];
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
    if(finalPanelWidth >= 100 && finalPanelWidth <= 500) {return "Panel Width: " + finalPanelWidth + this.sharedDataService.unitChoice;}
    else {return "-1";}
  }

  getPanelHeight():string {
    let height:number = this.sharedDataService.windowHeight;
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
    if(finalPanelHeight >= 100 && finalPanelHeight <= 500) {return "Panel Height: " + finalPanelHeight + this.sharedDataService.unitChoice;}
    else {return "-1";}
  }

  convertNumber(num:number, unit:string):number {
    if(unit == "mm") {return num;}
    else if(unit == "inches") {return num*25.4;}
    else {return num*10;};
  }

  getWindowWidth():string {
    return "Window Width: " + this.sharedDataService.windowWidth + this.sharedDataService.unitChoice;
  }

  getWindowHeight():string {
    return "Window Height: " + this.sharedDataService.windowHeight + this.sharedDataService.unitChoice;
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

}
