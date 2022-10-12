import { Component, OnInit } from '@angular/core';
import { share } from 'rxjs';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { Polygon, DividerWindow, WindowPane, SVGTemplate } from '../svgScaler';

declare var $:any;
@Component({
  selector: 'app-dimensions-form',
  templateUrl: './dimensions-form.component.html',
  styleUrls: ['./dimensions-form.component.css']
})
export class DimensionsFormComponent implements OnInit {
  unitChoice:string;

  constructor(public sharedDataService:SharedDataService) {
  }
  
  ngOnInit(): void {
    this.unitChoice = this.sharedDataService.unitChoice;
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


  getPanelWidths(width:number):number[] {
    if(width <= 0) {return [-1];}
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
    // Fixing panel width to be under 500
    if(finalPanelWidth > 500) {finalPanelWidth = finalPanelWidth / (Math.ceil(finalPanelWidth/500));}
    if(finalPanelWidth >= 100 && finalPanelWidth <= 500) {
      let finalWidths:number[] = [];
      let reductionFactor:number = 1;
      while(finalPanelWidth/reductionFactor >= 100 && finalPanelWidth/reductionFactor <= 500) {
        finalWidths.push(finalPanelWidth/reductionFactor);
        ++reductionFactor;
      }
      return finalWidths;
    }
    else {return [-1];}
  }

  getPanelHeights(height:number):number[] {
    if(height <= 0) {return [-1];}
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
    
    //if(finalPanelHeight >= 100 && finalPanelHeight <= 500) {return finalPanelHeight;}
    if(finalPanelHeight >= 100 && finalPanelHeight <= 500) {
      let finalHeights:number[] = [];
      let reductionFactor:number = 1;
      while(finalPanelHeight/reductionFactor >= 100 && finalPanelHeight/reductionFactor <= 500) {
        finalHeights.push(finalPanelHeight/reductionFactor);
        ++reductionFactor;
      }
      return finalHeights;
    }
    else {return [-1];}
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
    // console.log(finalText);
    

  }

  // Updating panel layout 2d array
  updatePanelLayout():void {
    // Getting possible widths and heights
    let topPanelWidths:number[] = this.getPanelWidths(this.sharedDataService.windowWidth);
    let topPanelHeights:number[] = this.getPanelHeights(this.sharedDataService.windowHeight);
    let bottomPanelWidths:number[] = this.getPanelWidths(this.sharedDataService.bottomSashWidth);
    let bottomPanelHeights:number[] = this.getPanelHeights(this.sharedDataService.bottomSashHeight);

    // Getting optimal widths and heights by checking every combination for top panels
    let bestCombo:number[] = [0, 0];
    let widthHeightRatio = topPanelWidths[0] / topPanelHeights[0];
    for(let widthIndex:number = 0; widthIndex < topPanelWidths.length; ++widthIndex) {
      for(let heightIndex:number = 0; heightIndex < topPanelHeights.length; ++heightIndex) {
        if(Math.abs(1 - topPanelWidths[widthIndex] / topPanelHeights[heightIndex]) < Math.abs(1 - widthHeightRatio)) {
          bestCombo = [widthIndex, heightIndex];
          widthHeightRatio = topPanelWidths[widthIndex] / topPanelHeights[heightIndex];
        }
      }
    }
    let topPanelWidth:number = topPanelWidths[bestCombo[0]];
    let topPanelHeight:number = topPanelHeights[bestCombo[1]];

    // Getting optimal bottom widths and heights by checking every combination for bottom panels
    bestCombo = [0, 0];
    widthHeightRatio = bottomPanelWidths[0] / bottomPanelHeights[0];
    for(let widthIndex:number = 0; widthIndex < bottomPanelWidths.length; ++widthIndex) {
      for(let heightIndex:number = 0; heightIndex < bottomPanelHeights.length; ++heightIndex) {
        if(Math.abs(1 - bottomPanelWidths[widthIndex] / bottomPanelHeights[heightIndex]) < Math.abs(1 - widthHeightRatio)) {
          bestCombo = [widthIndex, heightIndex];
          widthHeightRatio = bottomPanelWidths[widthIndex] / bottomPanelHeights[heightIndex];
        }
      }
    }
    let bottomPanelWidth:number = bottomPanelWidths[bestCombo[0]];
    let bottomPanelHeight:number = bottomPanelHeights[bestCombo[1]];

    let topLeftRight:number = Math.floor(this.sharedDataService.windowWidth/topPanelWidth);
    let topTopBottom:number = Math.floor(this.sharedDataService.windowHeight/topPanelHeight);
    let bottomLeftRight:number = Math.floor(this.sharedDataService.bottomSashWidth/bottomPanelWidth);
    let bottomTopBottom:number = Math.floor(this.sharedDataService.bottomSashHeight/bottomPanelHeight);
    console.log(bottomPanelWidth + " " + bottomPanelHeight);
    // let panelWidth:number = this.getPanelWidth(this.sharedDataService.windowWidth);
    // let panelHeight:number = this.getPanelHeight(this.sharedDataService.windowHeight);
    // let leftRight:number = Math.floor(this.sharedDataService.windowWidth/panelWidth);
    
    if(this.isDoubleHung() && topLeftRight != bottomLeftRight) {this.sharedDataService.panelLayoutDims = [-1, -1];}
    else {
      if(topTopBottom == -1 || (this.isDoubleHung() && bottomTopBottom == -1) || topLeftRight == -1) {this.sharedDataService.panelLayoutDims = [-1, -1];}
      else {
        let topBottom:number = this.isDoubleHung() ? topTopBottom + bottomTopBottom : topTopBottom;
        this.sharedDataService.panelLayout = [];
        for(let i:number = 0; i < topTopBottom; ++i) {
          this.sharedDataService.panelLayout.push([]);
        }
        this.sharedDataService.panelLayoutDims = [topLeftRight, topBottom];
        this.sharedDataService.topPanelWidth = topPanelWidth;
        this.sharedDataService.topPanelHeight = topPanelHeight;
        this.sharedDataService.bottomPanelWidth = bottomPanelWidth;
        this.sharedDataService.bottomPanelHeight = bottomPanelHeight;
        this.sharedDataService.numberTopPanels = topLeftRight * topTopBottom;
        console.log("Here: "  + this.sharedDataService.numberTopPanels);
      }
      
    }
    
    //console.log(this.sharedDataService.panelLayoutDims);
    // console.log("Panel width: " + panelWidth + "\nPanel height: " + panelHeight + "\nLayout: " + this.sharedDataService.panelLayoutDims);
  }

  // Method to clear old panes
  clearOldDividerPanes():void {
    let numPanes:number = this.sharedDataService.dividerWindow.windowPanes.length * this.sharedDataService.dividerWindow.windowPanes[0].length; 
    for(let i = 0; i < numPanes; ++i) {
      document.getElementById("dividerPane"+i)?.setAttribute("d", "");
      document.getElementById("dividerPane"+i)?.setAttribute("style", "")
      document.getElementById("dividerPane"+i)?.setAttribute("transform", "");
    }
  }

  //
  updateDimensionsButton():void {
    let newWidth:number = this.convertNumber(Number((<HTMLInputElement>document.getElementById("widthInput")).value), this.sharedDataService.unitChoice);
    let newHeight:number = this.convertNumber(Number((<HTMLInputElement>document.getElementById("heightInput")).value), this.sharedDataService.unitChoice);
    this.updateDimensions(newWidth, newHeight);
  }
  // Method to update dimensions
  updateDimensions(newWidth:number, newHeight:number):void {
    this.clearOldDividerPanes();
    
    // Getting the user's desired width and height and divider info
    // let newWidth:number = Number((<HTMLInputElement>document.getElementById("widthInput")).value);
    // let newHeight:number = Number((<HTMLInputElement>document.getElementById("heightInput")).value);
    let horzDividers:number;
    let vertDividers:number;
    let dividerWidth:number;
    
    if(this.sharedDataService.selectedDividerType == "nodiv") {
      horzDividers = 0;
      vertDividers = 0;
      dividerWidth = 0;
    }
    else {
      if(!this.sharedDataService.topSash) {
        horzDividers = this.sharedDataService.dividerNumbers[0];
        vertDividers = this.sharedDataService.dividerNumbers[1];
        dividerWidth = this.sharedDataService.dividerWidth;
      }
      else {
        horzDividers = Number((<HTMLInputElement>document.getElementById("horizontalDividersInput")).value);
        vertDividers = Number((<HTMLInputElement>document.getElementById("verticalDividersInput")).value);
        dividerWidth = this.convertNumber(Number((<HTMLInputElement>document.getElementById("dividerWidthInput")).value), this.sharedDataService.unitChoice); 
      }
      
    }
    if(dividerWidth == 0) {dividerWidth = 25.4;}
    // dividerWidth = this.convertNumber(dividerWidth, this.sharedDataService.unitChoice);
    let newDividerWindow:DividerWindow;
    if(this.sharedDataService.topSash) {
      this.sharedDataService.windowWidth = newWidth;
      this.sharedDataService.windowHeight = newHeight;
      newDividerWindow = new DividerWindow(newWidth >= 100 ? newWidth : undefined, newHeight >= 100 ? newHeight : undefined, horzDividers, vertDividers, dividerWidth, 
      this.sharedDataService.selectedDividerType, 
      this.sharedDataService.selectedWindowShape.substring(0, 2) == "2x" ? true : false, 
      this.sharedDataService.bottomSashWidth, this.sharedDataService.bottomSashHeight);
    }
    else {
      this.sharedDataService.bottomSashWidth = newWidth;
      this.sharedDataService.bottomSashHeight = newHeight;
      newDividerWindow = new DividerWindow(this.sharedDataService.windowWidth, this.sharedDataService.windowHeight, 
        horzDividers, vertDividers, dividerWidth, 
        this.sharedDataService.selectedDividerType, 
        this.sharedDataService.selectedWindowShape.substring(0, 2) == "2x" ? true : false, 
        newWidth >= 100 ? newWidth : undefined, newHeight >= 100 ? newHeight : undefined);
    }
    
    
    // Updating template dimensions
    document.getElementById("windowPerimeter")?.setAttribute("d", newDividerWindow.dString);
    document.getElementById("windowPerimeter")?.setAttribute("style", "fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:.2;");
    let viewboxValue:string = newDividerWindow.getViewbox();
    // if(this.isDoubleHung()) {
    //   viewboxValue = ""+ (-7 - (this.sharedDataService.windowWidth >= this.sharedDataService.bottomSashWidth ? 0 : (this.sharedDataService.bottomSashWidth - this.sharedDataService.windowWidth)/2)) +" "+ (-7) +" "+
    //   ((this.sharedDataService.windowWidth >= this.sharedDataService.bottomSashWidth ? this.sharedDataService.windowWidth : this.sharedDataService.bottomSashWidth)+14)+
    //   " "+(((this.sharedDataService.windowHeight + (this.sharedDataService.bottomSashHeight == -1 ? this.sharedDataService.windowHeight : this.sharedDataService.bottomSashHeight))+28));
      
    // }
    // else {viewboxValue = ""+ (-7) +" "+ (-7) +" "+(newWidth+14)+" "+(newHeight+14);}
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
    this.sharedDataService.dividerWidth = dividerWidth;
    this.sharedDataService.dividerNumbers = [horzDividers, vertDividers];
  }

  previousStage() {
    document.getElementById("stage2")?.scrollIntoView({behavior: 'smooth'});
  }

  isAvailableTemplate():boolean {
    let availableTemplate:boolean = false;
    if(this.sharedDataService.templateData == undefined) {return false;}
    for(let i:number = 0; i < this.sharedDataService.templateData.length; ++i) {
      if(this.sharedDataService.panelLayoutDims[0] == this.sharedDataService.templateData[i].panelDims[0]
        && this.sharedDataService.panelLayoutDims[1] == this.sharedDataService.templateData[i].panelDims[1] 
        && this.sharedDataService.templateData[i].category != undefined) {
          availableTemplate = true;
          break;
      }
    }
    return availableTemplate;
  }
  
  nextstage() {
    this.updateDimensionsButton();
    this.updatePanelLayout();
    let availableTemplate:boolean = this.isAvailableTemplate();
    if(availableTemplate && !(this.sharedDataService.panelLayoutDims[0] == -1 && this.sharedDataService.panelLayoutDims[1] == -1) && this.getPanelWidths(this.sharedDataService.windowWidth)[0] != -1 && this.getPanelHeights(this.sharedDataService.windowHeight)[0] != -1) {
      // console.log(this.sharedDataService.windowWidth + " " + this.sharedDataService.windowHeight);
      document.getElementById("templateCategoryStage")?.setAttribute("style", "visibility:visible;");
      $('#dimensionsFormModal').modal('hide');
      document.getElementById("templateCategoryStage")?.scrollIntoView({behavior: 'smooth'});
    }
    // Doesn't meet panel width/height requirements
    else {
      alert("We currently do not offer a template for that window shape.");
    }
    
  }

  // Method to get the correct
  sashButtonText():string {
    if(this.sharedDataService.topSash) {return "Switch to Bottom Sash";}
    return "Switch to Top Sash";
  }

  // Method to check whether selected window shape is a 2xHung
  isDoubleHung():boolean {
    if(this.sharedDataService.selectedWindowShape.substring(0, 2) == "2x") {return true;}
    return false;
  }

  // Method to switch the current Sash for a 2xHung window
  switchSash():void {
    this.updateDimensionsButton();
    this.sharedDataService.topSash = !this.sharedDataService.topSash;
    if(this.sharedDataService.finishedSashes == false) {
      this.sharedDataService.finishedSashes = true;
      document.getElementById("submitInput")?.removeAttribute("disabled");
      (<HTMLInputElement>document.getElementById("widthInput")).value = String(this.convertBackNumber(this.sharedDataService.windowWidth, this.sharedDataService.unitChoice));
      (<HTMLInputElement>document.getElementById("heightInput")).value = String(this.convertBackNumber(this.sharedDataService.windowHeight, this.sharedDataService.unitChoice));
    }
    else {
      (<HTMLInputElement>document.getElementById("widthInput")).value = String(this.convertBackNumber(this.sharedDataService.topSash ? this.sharedDataService.windowWidth : this.sharedDataService.bottomSashWidth, this.sharedDataService.unitChoice));
      (<HTMLInputElement>document.getElementById("heightInput")).value = String(this.convertBackNumber(this.sharedDataService.topSash ? this.sharedDataService.windowHeight : this.sharedDataService.bottomSashHeight, this.sharedDataService.unitChoice));
    }
  }

  unitText() {
    if(this.sharedDataService.unitChoice == "inches") {return "in";}
    return this.sharedDataService.unitChoice;
  }

  getWindowWidth():string {
    return (this.isDoubleHung() ? "Top Sash Width: " : "Window Width: ") + this.convertBackNumber(this.sharedDataService.windowWidth, this.sharedDataService.unitChoice).toFixed(2) + " " + this.sharedDataService.unitChoice;
  }

  getWindowHeight():string {
    return (this.isDoubleHung() ? "Top Sash Height: " : "Window Height: ") + this.convertBackNumber(this.sharedDataService.windowHeight, this.sharedDataService.unitChoice).toFixed(2) + " " + this.sharedDataService.unitChoice;
  }

  getBottomSashWidth():string {
    return "Bottom Sash Width: " + this.convertBackNumber(this.sharedDataService.bottomSashWidth, this.sharedDataService.unitChoice).toFixed(2) + " " + this.sharedDataService.unitChoice;
  }

  getBottomSashHeight():string {
    return "Bottom Sash Height: " + this.convertBackNumber(this.sharedDataService.bottomSashHeight, this.sharedDataService.unitChoice).toFixed(2) + " " + this.sharedDataService.unitChoice;
  }

  getWindowPaneWidth(top:boolean = true):string {
    let width:number = top ? this.sharedDataService.windowWidth : this.sharedDataService.bottomSashWidth;
    let vertDividers:number = this.sharedDataService.dividerNumbers[1] ? this.sharedDataService.dividerNumbers[1] : 0;
    let finalPanelWidth:number = 0; 
    if(this.sharedDataService.selectedDividerType == 'nodiv') {
      if(width >= 100 && width <=500) {finalPanelWidth = width;}
      else {finalPanelWidth = width / (Math.ceil(width/500));}
    }
    // raised or embedded divs
    else {
      finalPanelWidth = ((width - (vertDividers*this.sharedDataService.dividerWidth)) / (vertDividers+1));
    }
    // Fixing panel height to be under 500
    if(finalPanelWidth >= 500) {finalPanelWidth = finalPanelWidth / (Math.ceil(finalPanelWidth/500));}

    if(finalPanelWidth >= 100 && finalPanelWidth <= 500) {return (this.isDoubleHung() ? (top ? "Top Pane Width: " : "Bottom Pane Width: ") : "Pane Width: ") + this.convertBackNumber(finalPanelWidth, this.sharedDataService.unitChoice).toFixed(2) + " " + this.sharedDataService.unitChoice;}
    else {return "-1";}
  }

  getWindowPaneHeight(top:boolean = true):string {
    let height:number = top ? this.sharedDataService.windowHeight : this.sharedDataService.bottomSashHeight;
    let horzDividers:number = this.sharedDataService.dividerNumbers[0];
    let finalPanelHeight:number = 0; 
    if(this.sharedDataService.selectedDividerType == 'nodiv') {
      if(height >= 100 && height <=500) {finalPanelHeight = height;}
      else {finalPanelHeight = height / (Math.ceil(height/500));}
    }
    // raised or embedded divs
    else {
      finalPanelHeight = ((height - (horzDividers*this.sharedDataService.dividerWidth)) / (horzDividers+1));
    }
    // Fixing panel height to be under 500
    if(finalPanelHeight >= 500) {finalPanelHeight = finalPanelHeight / (Math.ceil(finalPanelHeight/500));}

    if(finalPanelHeight >= 100 && finalPanelHeight <= 500) {return (this.isDoubleHung() ? (top ? "Top Pane Height: " : "Bottom Pane Height: ") : "Pane Height: ") + this.convertBackNumber(finalPanelHeight, this.sharedDataService.unitChoice).toFixed(2) + " " + this.sharedDataService.unitChoice;}
    else {return "-1";}
  }

}
