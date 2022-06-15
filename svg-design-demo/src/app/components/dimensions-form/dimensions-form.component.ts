import { Component, OnInit } from '@angular/core';
import { share } from 'rxjs';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { Polygon, DividerWindow, WindowPane, SVGTemplate } from '../svgScaler';

@Component({
  selector: 'app-dimensions-form',
  templateUrl: './dimensions-form.component.html',
  styleUrls: ['./dimensions-form.component.css']
})
export class DimensionsFormComponent implements OnInit {
  constructor(private sharedDataService:SharedDataService) { }

  ngOnInit(): void {
  }

/* SAVING FOR LATER USE IN STEP 4
  // Method to update dimensions 
  updateDimensions():void {
    // Getting the user's desired width and height
    let newWidth:number = Number((<HTMLInputElement>document.getElementById("widthInput")).value);
    let newHeight:number = Number((<HTMLInputElement>document.getElementById("heightInput")).value);
    
    let xScale:number = newWidth / this.sharedDataService.currentSvgTemplate.width;
    let yScale:number = newHeight / this.sharedDataService.currentSvgTemplate.height;

    // Returns [newD, newXScale, newYScale]
    let newTemplateInfo:string[] = this.sharedDataService.currentSvgTemplate.getScaledD(xScale, yScale);
    let newTemplate:SVGTemplate = new SVGTemplate(newTemplateInfo[0]);

    // Updating template dimensions
    document.getElementById("svgTemplate")?.setAttribute("d", newTemplate.getOptimizedD());
    document.getElementById("svgTemplate")?.setAttribute("transform", "scale("+newTemplateInfo[1]+","+newTemplateInfo[2]+")");
    let viewboxValue:string = ""+(newTemplate.xMin*Number(newTemplateInfo[1]))+" "+(newTemplate.yMin*Number(newTemplateInfo[2]))+" "+(newTemplate.width*Number(newTemplateInfo[1]))+" "+(newTemplate.height*Number(newTemplateInfo[2]));
    document.getElementById("currentTemplate")?.setAttribute("viewBox", viewboxValue);

    let paneNum:number = 0;
    for(let i:number = 0; i < newTemplate.subShapes.length; ++i) {
      if(i == newTemplate.outerEdgeIndex) {continue;}
      // Updating each individual pane
      document.getElementById("pane"+paneNum)?.setAttribute("d", newTemplate.subShapes[i].getScalablePath());
      document.getElementById("pane"+paneNum)?.setAttribute("transform", "scale("+newTemplateInfo[1]+","+newTemplateInfo[2]+")");
      ++paneNum;
    }
  }
*/
  unitChoice:string = this.sharedDataService.unitChoice;


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
        (vertDividers/(vertDividers+1)) > 500) {
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
        (horzDividers/(horzDividers+1)) > 500) {
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
    console.log(finalText);
    

  }

  // Updating panel layout 2d array
  updatePanelLayout():void {
    let panelWidth:number = this.getPanelWidth(this.convertNumber(this.sharedDataService.windowWidth, this.sharedDataService.unitChoice));
    let panelHeight:number = this.getPanelHeight(this.convertNumber(this.sharedDataService.windowHeight, this.sharedDataService.unitChoice));
    let leftRight:number = Math.floor(this.sharedDataService.windowWidth/panelWidth);
    let topBottom:number = Math.floor(this.sharedDataService.windowHeight/panelHeight);

    this.sharedDataService.panelLayout = [];
    for(let i:number = 0; i < topBottom; ++i) {
      this.sharedDataService.panelLayout.push([]);
    }
    this.sharedDataService.panelLayoutDims = [leftRight, topBottom];
    alert("Panel width: " + panelWidth + "\nPanel height: " + panelHeight + "\nLayout: " + this.sharedDataService.panelLayoutDims);
  }

  // Method to clear old panes
  clearOldDividerPanes():void {
    let numPanes:number = this.sharedDataService.dividerWindow.windowPanes.length*2; 
    for(let i = 0; i < numPanes; ++i) {
      document.getElementById("dividerPane"+i)?.setAttribute("d", "");
      document.getElementById("dividerPane"+i)?.setAttribute("style", "")
      document.getElementById("dividerPane"+i)?.setAttribute("transform", "");
    }
  }

  //
  updateDimensionsButton():void {
    let newWidth:number = Number((<HTMLInputElement>document.getElementById("widthInput")).value);
    let newHeight:number = Number((<HTMLInputElement>document.getElementById("heightInput")).value);
    this.updateDimensions(newWidth, newHeight);
  }
  // Method to update dimensions
  updateDimensions(newWidth:number, newHeight:number):void {
    if(this.sharedDataService.dividerWindow != null) {this.clearOldDividerPanes();}
    // Getting the user's desired width and height and divider info
    // let newWidth:number = Number((<HTMLInputElement>document.getElementById("widthInput")).value);
    // let newHeight:number = Number((<HTMLInputElement>document.getElementById("heightInput")).value);
    let horzDividers:number;
    let vertDividers:number;
    let dividerWidth:number;
    if(this.sharedDataService.selectedDividerType == "plain") {
      horzDividers = 0;
      vertDividers = 0;
      dividerWidth = 0;
    }
    else {
      horzDividers = Number((<HTMLInputElement>document.getElementById("horizontalDividersInput")).value);
      vertDividers = Number((<HTMLInputElement>document.getElementById("verticalDividersInput")).value);
      dividerWidth = Number((<HTMLInputElement>document.getElementById("dividerWidthInput")).value);
    }
    if(dividerWidth == 0) {dividerWidth = 2;}
    let newDividerWindow:DividerWindow = new DividerWindow(newWidth, newHeight, horzDividers, vertDividers, dividerWidth, this.sharedDataService.selectedDividerType, this.sharedDataService.selectedWindowShape.substring(0, 2) == "2x" ? true : false);
    
    // Updating template dimensions
    document.getElementById("windowPerimeter")?.setAttribute("d", newDividerWindow.dString);
    document.getElementById("windowPerimeter")?.setAttribute("style", "fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:.2;");
    let viewboxValue:string;
    if(this.sharedDataService.selectedWindowShape.substring(0, 2) == "2x") {
      viewboxValue = ""+ (-7) +" "+ (-7) +" "+(newWidth+14)+" "+(2*(newHeight+14));
    }
    else {viewboxValue = ""+ (-7) +" "+ (-7) +" "+(newWidth+14)+" "+(newHeight+14);}
    document.getElementById("dividerTemplate")?.setAttribute("viewBox", viewboxValue);

    let paneNum:number = 0;
    for(let row:number = 0; row < newDividerWindow.windowPanes.length; ++row) {
      for(let col:number = 0; col < newDividerWindow.windowPanes[row].length; ++col) {
        // Updating each individual pane
        document.getElementById("dividerPane"+paneNum)?.setAttribute("d", newDividerWindow.windowPanes[row][col].dString);
        document.getElementById("dividerPane"+paneNum)?.setAttribute("style", "fill:#ECECEC;fill-rule:evenodd;stroke:#000000;stroke-width:.2;");
        ++paneNum;
      }
      
    }

    this.sharedDataService.dividerWindow = newDividerWindow;
    this.sharedDataService.windowWidth = newWidth;
    this.sharedDataService.windowHeight = newHeight;
    this.sharedDataService.dividerWidth = dividerWidth;
    this.sharedDataService.dividerNumbers = [horzDividers, vertDividers];
  }

  nextstage() {
    this.updatePanelLayout();
    document.getElementById("templateCategoryStage")?.setAttribute("style", "visibility:visible;")
    document.getElementById("templateCategoryStage")?.scrollIntoView({behavior: 'smooth'});
  }

}
