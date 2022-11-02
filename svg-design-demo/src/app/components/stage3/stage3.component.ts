import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-stage3',
  templateUrl: './stage3.component.html',
  styleUrls: ['./stage3.component.css']
})
export class Stage3Component implements OnInit {

  constructor(private sharedDataService:SharedDataService) { }

  ngOnInit(): void {
  }

  getPanelWidth(width:number):number {
    let vertDividers:number = this.sharedDataService.dividerNumbers[1];
    let finalPanelWidth:number = 0; 
    if(this.sharedDataService.selectedDividerType == 'nodiv') {
      if(width >= 100 && width <=500) {finalPanelWidth = width;}
      else {finalPanelWidth = width / (Math.ceil(width/500));}
    }
    else if(this.sharedDataService.selectedDividerType == 'embeddeddiv') {
      // Spacing using user's dividers is bigger than 500
      if(((width - (vertDividers*this.sharedDataService.dividerWidth)) / (vertDividers+1)) + 
        (this.sharedDataService.dividerWidth/(vertDividers+1)) > 500) {
          finalPanelWidth = ((width - (vertDividers*this.sharedDataService.dividerWidth)) / (vertDividers+1)) + 
            (vertDividers/(vertDividers+1)) / Math.ceil((((width - (vertDividers*this.sharedDataService.dividerWidth)) / (vertDividers+1)) + 
            (vertDividers/(vertDividers+1))) / 500);
      }
      // Spacing using user's dividers is >= 100 and <= 500 (perfect)
      else if(((width - (vertDividers*this.sharedDataService.dividerWidth)) / (vertDividers+1)) + 
        (vertDividers/(vertDividers+1)) >= 100) {
          finalPanelWidth = (((width - (vertDividers*this.sharedDataService.dividerWidth)) / (vertDividers+1)) + 
            (vertDividers/(vertDividers+1)));
      }
      // Spacing is too small (have to ignore dividers)
      else {
        if(width >= 100 && width <=500) {finalPanelWidth = width;}
        else {finalPanelWidth = width / (Math.ceil(width/500));}
      }
      
    }
    // raised divs
    else {
      finalPanelWidth = ((width - (vertDividers*this.sharedDataService.dividerWidth)) / (vertDividers+1));
    }
    if(finalPanelWidth >= 100 && finalPanelWidth <= 500) {return finalPanelWidth;}
    else {return -1;}
  }

  getPanelHeight(height:number):number {
    let horzDividers:number = this.sharedDataService.dividerNumbers[0];
    let finalPanelHeight:number = 0; 
    if(this.sharedDataService.selectedDividerType == 'nodiv') {
      if(height >= 100 && height <=500) {finalPanelHeight = height;}
      else {finalPanelHeight = height / (Math.ceil(height/500));}
    }
    else if(this.sharedDataService.selectedDividerType == 'embeddeddiv') {
      // Spacing using user's dividers is bigger than 500
      if(((height - (horzDividers*this.sharedDataService.dividerWidth)) / (horzDividers+1)) + 
        (this.sharedDataService.dividerWidth/(horzDividers+1)) > 500) {
          finalPanelHeight = ((height - (horzDividers*this.sharedDataService.dividerWidth)) / (horzDividers+1)) + 
            (horzDividers/(horzDividers+1)) / Math.ceil((((height - (horzDividers*this.sharedDataService.dividerWidth)) / (horzDividers+1)) + 
            (horzDividers/(horzDividers+1))) / 500);
      }
      // Spacing using user's dividers is >= 100 and <= 500 (perfect)
      else if(((height - (horzDividers*this.sharedDataService.dividerWidth)) / (horzDividers+1)) + 
        (horzDividers/(horzDividers+1)) >= 100) {
          finalPanelHeight = (((height - (horzDividers*this.sharedDataService.dividerWidth)) / (horzDividers+1)) + 
            (horzDividers/(horzDividers+1)));
      }
      // Spacing is too small (have to ignore dividers)
      else {
        if(height >= 100 && height <=500) {finalPanelHeight = height;}
        else {finalPanelHeight = height / (Math.ceil(height/500));}
      }
      
    }
    // raised divs
    else {
      finalPanelHeight = ((height - (horzDividers*this.sharedDataService.dividerWidth)) / (horzDividers+1));
    }
    if(finalPanelHeight >= 100 && finalPanelHeight <= 500) {return finalPanelHeight;}
    else {return -1;}
  }

  convertNumber(num:number, unit:string):number {
    if(unit == "mm") {return num;}
    else if(unit == "inches") {return num*25.4;}
    else {return num*10;};
  }
  
  getFinalInfo():void {
    let finalText:string = 
    "Divider Type: " + this.sharedDataService.selectedDividerType + "\n" + 
    "Window Shape: " + this.sharedDataService.selectedWindowShape + "\n" +
    "Unit of measure: " + this.sharedDataService.unitChoice + " to mm\n" +
    "Width: " + this.convertNumber(this.sharedDataService.windowWidth, this.sharedDataService.unitChoice) + "mm\n" + 
    "Height: " + this.convertNumber(this.sharedDataService.windowHeight, this.sharedDataService.unitChoice) + "mm\n" +
    // "Panel Width: " + this.getPanelWidthHeight(this.convertNumber(this.sharedDataService.windowWidth, this.sharedDataService.unitChoice)) + "mm\n" +
    // "Panel Height: " + this.getPanelWidthHeight(this.convertNumber(this.sharedDataService.windowHeight, this.sharedDataService.unitChoice)) + "mm\n" +
    "Template: " + this.sharedDataService.currentWindowNumber + "\n"
    "Color Selection: " + "\n";

    var serializer = new XMLSerializer();
    var xmlString = serializer.serializeToString(document.getElementById("windowPreviewContainertrue")!);
    let svgText:string[] = xmlString.split("<svg");
    for(let i:number = 0; i < svgText.length; ++i) {svgText[i] = "<svg" + svgText[i]; finalText += svgText[i] + "\n\n";}
  }

  // Updating panel layout 2d array
  updatePanelLayout():void {
    let panelWidth:number = this.getPanelWidth(this.convertNumber(this.sharedDataService.windowWidth, this.sharedDataService.unitChoice));
    let panelHeight:number = this.getPanelHeight(this.convertNumber(this.sharedDataService.windowHeight, this.sharedDataService.unitChoice));
    let leftRight:number = Math.ceil(this.sharedDataService.windowWidth/panelWidth);
    let topBottom:number = Math.ceil(this.sharedDataService.windowHeight/panelHeight);

    this.sharedDataService.panelLayout = [];
    for(let i:number = 0; i < topBottom; ++i) {
      this.sharedDataService.panelLayout.push([]);
    }
    this.sharedDataService.panelLayoutDims = [leftRight, topBottom];
  }

  changeUnits(unitChoice:string):void {
    if(unitChoice != this.sharedDataService.unitChoice) {this.sharedDataService.resetFractionNums();}
    this.sharedDataService.unitChoice = unitChoice;
    // Updating the placeholders for each input
    // document.getElementById("widthUnits")!.textContent = unitChoice;
    // document.getElementById("heightUnits")!.textContent = unitChoice;
    document.getElementById("dropdownMenuButton")!.innerHTML = "Your selected unit of measure is " + this.sharedDataService.unitChoice;
    // document.getElementById("dividerWidthUnits")!.textContent = unitChoice;
    document.getElementById("dividerDetailText")?.setAttribute("style", "visibility:visible;")
  }

  previousStage() {
    document.getElementById("stage2")?.scrollIntoView({behavior: 'smooth'});
  }
  nextstage4() {
    this.updatePanelLayout();
    document.getElementById("stage4")?.setAttribute("style", "visibility:visible;")
    document.getElementById("stage4")?.scrollIntoView({behavior: 'smooth'});
  }

  
}
