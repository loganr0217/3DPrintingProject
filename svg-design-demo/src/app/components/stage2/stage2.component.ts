import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { DividerWindow } from '../svgScaler';


@Component({
  selector: 'app-stage2',
  templateUrl: './stage2.component.html',
  styleUrls: ['./stage2.component.css']
})
export class Stage2Component implements OnInit {

  constructor(private sharedDataService:SharedDataService, private location: Location) { }
  
  // Stage 2 attributes
  dividerType:string;
  windowShape:string;
  windowShapes:string[];

  ngOnInit(): void {
    this.dividerType = this.sharedDataService.selectedDividerType;
    this.windowShape = this.sharedDataService.selectedWindowShape;
    this.windowShapes = this.sharedDataService.windowShapes;
  }

  displayWindowShapes(dividerType:string) {
    // // Adding new window shapes
    // let iter:number = 0;
    // for(let i = 0; i < this.windowShapes.length; ++i) {
    //   if(this.windowShapes[i].includes(windowShapeExample)) {
    //     // Getting type of window and default dimensions
    //     let windowDimensions:string[] = this.windowShapes[i].slice(this.windowShapes[i].length-4).split("to");
    //     let width:number = Number(windowDimensions[0])*5;
    //     let height:number = Number(windowDimensions[1])*5;
    //     document.getElementById("windowShapeImage_"+this.windowShapes[iter])?.setAttribute("src", "assets/img/windowButtons2/"+this.windowShapes[i]+this.dividerType+".svg");
    //     document.getElementById("windowShapeImage_"+this.windowShapes[iter])?.setAttribute("style", "visibility:visible; width:"+width+"vw; height:"+height+"vw;");
    //     ++iter;
    //   }
    // }
    for(let i = 0; i < this.windowShapes.length; ++i) {
        document.getElementById("windowShapeImage_"+this.windowShapes[i])?.setAttribute("src", "assets/img/windowButtons2/"+this.windowShapes[i]+this.dividerType+".svg");
        document.getElementById("windowShapeImage_"+this.windowShapes[i])?.setAttribute("style", "visibility:visible;");
    }
  }

  // Method to change the currently selected divider
  chooseDivider(dividerType:string) {
    document.getElementById("windowShapeText")?.setAttribute("style", "visibility:visible;");
    document.getElementById("section2")?.setAttribute("style", "visibility:visible;");
    document.getElementById("windowShapeExamples")?.setAttribute("style", "visibility:visible;");
    // Unhighlighting old selection if possible and highlighting new one
    if(this.dividerType != null) {document.getElementById("dividerTypeImage_"+this.dividerType)?.setAttribute("style", "");}
    document.getElementById("dividerTypeImage_"+dividerType)?.setAttribute("style", "filter: invert(25%);");
    if(dividerType == "nodiv") {
      // document.getElementById("dividerDetailsText")!.innerHTML = "";
      document.getElementById("horizontalDividersInput")?.setAttribute("disabled", "true");
      document.getElementById("verticalDividersInput")?.setAttribute("disabled", "true");
      document.getElementById("dividerDetailInputs")?.setAttribute("style", "display:none;");
    }
    else {
      // document.getElementById("dividerDetailsText")!.innerHTML = "Now, tell us the number of window dividers and their width.";
      document.getElementById("horizontalDividersInput")?.removeAttribute("disabled");
      document.getElementById("verticalDividersInput")?.removeAttribute("disabled");
      document.getElementById("dividerDetailInputs")?.setAttribute("style", "display:inline;");
    }
    
    // Updating values for dividerType
    this.sharedDataService.selectedDividerType = dividerType;
    this.dividerType = dividerType;

    // Updating the dividerWindow if it exists already
    if(this.sharedDataService.dividerWindow != null) {
      this.sharedDataService.dividerWindow.updateDividerType(dividerType);
      document.getElementById("windowPerimeter")?.setAttribute("d", this.sharedDataService.dividerWindow.dString);
    }

    this.displayWindowShapes(dividerType);
  }

  chooseWindowExample(windowExample:string):void {
    document.getElementById("windowShapeExamples")?.setAttribute("src", "");
    document.getElementById("windowShapeExamples")?.setAttribute("style", "visibility:hidden;");
    this.displayWindowShapes(windowExample);
  }

  // Method to change the currently selected window shape
  chooseWindowShape(windowShape:string) {
    // Unhighlighting old selection if possible and highlighting new one
    if(this.windowShape != null) {document.getElementById("windowShapeImage_"+this.windowShape)?.setAttribute("style", "");}
    document.getElementById("windowShapeImage_"+windowShape)?.setAttribute("style", "filter: invert(25%);");
    
    // Updating values for windowShape
    this.windowShape = windowShape;

    // Getting type of window and default dimensions
    let windowDimensions:string[] = windowShape.slice(windowShape.length-4).split("to");
    let widthHeightRatio:number = Number(windowDimensions[0])/Number(windowDimensions[1]);
    let numHorizontalDividers:number = Number(windowDimensions[1])-1;
    let numVerticalDividers:number = Number(windowDimensions[0])-1;
    let defaultWidth:number;
    if(widthHeightRatio >= 1) {defaultWidth = 400;}
    else {defaultWidth = 100;}
    let defaultHeight:number = defaultWidth / widthHeightRatio;

    this.sharedDataService.selectedWindowShape = windowShape;
    // Setting default dimensions for step 3
    this.updateDimensions(defaultWidth, defaultHeight, numHorizontalDividers, numVerticalDividers);
    this.sharedDataService.topSash = true;
    if(this.isDoubleHung()) {
      this.sharedDataService.finishedSashes = false;
      document.getElementById("submitInput")?.setAttribute("disabled", "true");
    }
    else {
      this.sharedDataService.finishedSashes = true;
      document.getElementById("submitInput")?.removeAttribute("disabled");
    }
    this.nextstage3();
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

  // Method to update dimensions
  updateDimensions(newWidth:number, newHeight:number, horizontalDividers:number, verticalDividers:number):void {
    if(this.sharedDataService.dividerWindow != null) {this.clearOldDividerPanes();}
    
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
      horzDividers = horizontalDividers;
      vertDividers = verticalDividers;
      dividerWidth = 2;
    }
    let newDividerWindow:DividerWindow = new DividerWindow(newWidth, newHeight, horzDividers, vertDividers, dividerWidth, this.sharedDataService.selectedDividerType, this.windowShape.substring(0, 2) == "2x" ? true : false);

    // Updating template dimensions
    document.getElementById("windowPerimeter")?.setAttribute("d", newDividerWindow.dString);
    document.getElementById("windowPerimeter")?.setAttribute("style", "fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:.2;");
    let viewboxValue:string = newDividerWindow.getViewbox();
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
  }
  
  nextstage2BCon() {
    document.getElementById("stage2BCon")?.scrollIntoView({behavior: 'smooth'});
  }

  preStage1Con() {
    document.getElementById("entirePage")?.scrollIntoView({behavior: 'smooth'});
  }

  prestage2ACon() {
    document.getElementById("stage2ACon")?.scrollIntoView({behavior: 'smooth'});
  }

  nextstage3() {
    document.getElementById("stage3")?.setAttribute("style", "visibility:visible;")
    document.getElementById("stage3")?.scrollIntoView({behavior: 'smooth'});
  }

  dividerName(id:string):string {
    if(id == "nodiv") {return "No Dividers";}
    else if(id == "raiseddiv") {return "Raised Dividers";}
    else if(id == "embeddeddiv") {return "Embedded Dividers";}
    else {return "";}
  }

  windowShapeExample(windowShape:string):string {
    if(windowShape == "square2to2") {return "Square";}
    else if(windowShape == "2xhung2to4") {return "Double Hung";}
    else if(windowShape == "horizontal4to1") {return "Horizontal";}
    else if(windowShape == "vertical2to4") {return "Casement";}
    else {return "";}
  }

  // Method to check whether selected window shape is a 2xHung
  isDoubleHung():boolean {
    if(this.sharedDataService.selectedWindowShape.substring(0, 2) == "2x") {return true;}
    return false;
  }

}
