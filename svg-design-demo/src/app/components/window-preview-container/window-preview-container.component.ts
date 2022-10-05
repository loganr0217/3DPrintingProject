import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { SVGTemplate } from '../svgScaler';
import { Input } from '@angular/core';

@Component({
  selector: 'app-window-preview-container',
  templateUrl: './window-preview-container.component.html',
  styleUrls: ['./window-preview-container.component.css']
})
export class WindowPreviewContainerComponent implements OnInit {
  @Input() finished:boolean;
  
  // Array containing the svgPath data for displaying icons / generating a template
  svgTemplateData:{id:number, name:string, d:string}[][];
  currentPanel:number;
  currentWindow:{id:number, name:string, d:string}[];
  panelLayout:SVGTemplate[][];
  panelDims:number[];
  currentPanelLocation:number[];

  constructor(public sharedDataService:SharedDataService) { }

  // Method to move to next pane in window
  // nextPane():void {
  //   if(this.sharedDataService.currentTemplateNumber != -1) {
  //     ++this.sharedDataService.currentTemplateNumber;
  //     this.sharedDataService.currentTemplateNumber %= this.sharedDataService.svgTemplateData[this.sharedDataService.currentWindowNumber].length;
  //     this.clearOldPanes();
  //     this.displayTemplate(this.sharedDataService.svgTemplateData[this.sharedDataService.currentWindowNumber][this.sharedDataService.currentTemplateNumber].d);
  //   }
  // }

  // Method to clear old panes
  clearOldPanes():void {
    let numPanes = this.sharedDataService.numberPanes;
    for(let i = 0; i < numPanes; ++i) {
      document.getElementById("pane"+i)?.setAttribute("d", "");
      document.getElementById("pane"+i)?.setAttribute("style", "")
      document.getElementById("pane"+i)?.setAttribute("transform", "");
    }
    this.sharedDataService.numberPanes = 0;
  }

  // Updates current template in display window with selected version
  displayTemplate(svgD:string, row:number, col:number, transformValue:string):void {
    this.clearOldPanes();
    let panelNum = row*this.sharedDataService.panelLayoutDims[0]+col;
    this.sharedDataService.currentSvgTemplate = this.sharedDataService.panelLayout[row][col];
    this.sharedDataService.currentTemplateNumber = row*this.sharedDataService.panelLayoutDims[0] + col;

    let newTemplate:SVGTemplate = new SVGTemplate(this.sharedDataService.currentSvgTemplate.getOptimizedD());
    transformValue = newTemplate.getTransform();

    let numPane:number = 0; // <-- In case the outer edge is not the first element
    // Adding each individual pane
    for(let i = 0; i < newTemplate.subShapes.length; ++i) {
      if(i != newTemplate.outerEdgeIndex) {
        document.getElementById("pane"+numPane)?.setAttribute("d", newTemplate.subShapes[i].getScalablePath());
        
        // Filling the pane with a saved color or blank
        let savedStyle = document.getElementById("windowPane"+this.sharedDataService.currentTemplateNumber+"_"+numPane)?.getAttribute("style");
        if(savedStyle != null) {
          document.getElementById("pane"+numPane)?.setAttribute("style", savedStyle);
          document.getElementById("pane"+numPane)?.setAttribute("transform", transformValue);
        }
        else {
          document.getElementById("pane"+numPane)?.setAttribute("style", "fill:#f0f0f1");
          document.getElementById("pane"+numPane)?.setAttribute("transform", transformValue);
        }
        ++numPane;
      }
    }
    this.sharedDataService.numberPanes = numPane;

    
    // Updating the current displayed template
    document.getElementById("svgTemplate")?.setAttribute("d", newTemplate.getOptimizedD());

    let viewboxValue:string = ""+newTemplate.xMin+" "+newTemplate.yMin+" "+newTemplate.width+" "+newTemplate.height;
    document.getElementById("currentTemplate")?.setAttribute("viewBox", viewboxValue);
    document.getElementById("svgTemplate")?.setAttribute("transform", transformValue);
    // document.getElementById("currentTemplate")?.setAttribute("width", ""+newTemplate.width+"mm");
    // document.getElementById("currentTemplate")?.setAttribute("height", ""+newTemplate.height+"mm");
  }

  // Gets the icon width in vw
  getIconWidth(row:number, col:number):string {
    // Height > width --> use height instead
    if((this.sharedDataService.windowHeight + this.sharedDataService.bottomSashHeight) >= (this.sharedDataService.windowWidth > this.sharedDataService.bottomSashWidth ? this.sharedDataService.windowWidth : this.sharedDataService.bottomSashWidth)) {
      return "";
    }
    let panelNum = row*this.sharedDataService.panelLayoutDims[0]+col;
    let normWidth:number, tmp:number;
    if(panelNum < this.sharedDataService.numberTopPanels) {
      normWidth = (this.sharedDataService.topPanelWidth - 100) / (500 - 100);
      tmp = this.sharedDataService.topPanelWidth / (this.sharedDataService.windowWidth > this.sharedDataService.bottomSashWidth ? this.sharedDataService.windowWidth : this.sharedDataService.bottomSashWidth);
    }
    else {
      normWidth = (this.sharedDataService.bottomPanelWidth - 100) / (500 - 100);
      tmp = this.sharedDataService.bottomPanelWidth / (this.sharedDataService.windowWidth > this.sharedDataService.bottomSashWidth ? this.sharedDataService.windowWidth : this.sharedDataService.bottomSashWidth);
    }
    let adjustedWidth:number = normWidth*(7-5)+5;
    return 40*tmp + "vw";
  }

  // Gets the icon width in vw
  getIconHeight(row:number, col:number):string {
    // Width >= height --> use width instead
    if((this.sharedDataService.windowHeight + this.sharedDataService.bottomSashHeight) < (this.sharedDataService.windowWidth > this.sharedDataService.bottomSashWidth ? this.sharedDataService.windowWidth : this.sharedDataService.bottomSashWidth)) {
      return "";
    }
    let panelNum = row*this.sharedDataService.panelLayoutDims[0]+col;
    let normHeight:number, tmp:number;

    if(panelNum < this.sharedDataService.numberTopPanels) {
      normHeight = (this.sharedDataService.topPanelHeight - 100) / (500 - 100);
      tmp = this.sharedDataService.topPanelHeight / (this.sharedDataService.windowHeight + this.sharedDataService.bottomSashHeight);
    }
    else {
      normHeight = (this.sharedDataService.bottomPanelHeight - 100) / (500 - 100);
      tmp = this.sharedDataService.bottomPanelHeight / (this.sharedDataService.windowHeight + this.sharedDataService.bottomSashHeight);
    }
    let adjustedHeight:number = normHeight*(7-5)+5;

    return 80*tmp + "vh";
  }

  // Gets template viewbox
  getTemplateViewBox(row:number, col:number):string {
    let myTemplate:SVGTemplate = this.sharedDataService.panelLayout[row][col];
    let panelNum = row*this.sharedDataService.panelLayoutDims[0]+col;
    
    let scaleX:number;
    let scaleY:number;
    let result:string[];
    let d:string;
    if(panelNum < this.sharedDataService.numberTopPanels) {
      result = myTemplate.getScaledD(this.sharedDataService.topPanelWidth/300, this.sharedDataService.topPanelHeight/300);
      // scaleX = this.sharedDataService.topPanelWidth/300;
      // scaleY = this.sharedDataService.topPanelHeight/300;
    }
    else {
      result = myTemplate.getScaledD(this.sharedDataService.bottomPanelWidth/300, this.sharedDataService.bottomPanelHeight/300);
      // scaleX = this.sharedDataService.bottomPanelWidth/300;
      // scaleY = this.sharedDataService.bottomPanelHeight/300;
    }
    d = result[0];
    scaleX = Number(result[1]);
    scaleY = Number(result[2]);
    let tmp:SVGTemplate = new SVGTemplate(d);

    
    console.log(panelNum + ", " + myTemplate.width + ", " + myTemplate.height);
    let tempViewBox:string = (scaleX * tmp.xMin) + " " + (scaleY * tmp.yMin) + " " + (scaleX * tmp.width) + " " + (scaleY * tmp.height);
    return tempViewBox;
  }

  ngOnInit(): void {
    this.panelLayout = this.sharedDataService.panelLayout;
  }

  range(i:number):number[] {
    return [...Array(i).keys()];
  }

  getPaneID(row:number, col:number, paneNum:number):string {
    if(!this.finished) {return "windowPane" + (row*this.sharedDataService.panelLayoutDims[0] + col) + "_" + paneNum;}
    else {return "windowPaneFinished" + (row*this.sharedDataService.panelLayoutDims[0] + col) + "_" + paneNum;}
  }

  getPaneStyle(row:number, col:number, paneNum:number):string {
    return "fill:#"+this.sharedDataService.panelColoringArray[(row*this.sharedDataService.panelLayoutDims[0] + col)][paneNum];
  }

  getPanelID(row:number, col:number):string {
    if(!this.finished) {return "windowSVG" + (row*this.sharedDataService.panelLayoutDims[0] + col);}
    else {return "windowSVGFinished" + (row*this.sharedDataService.panelLayoutDims[0] + col);}
  }

  getRotation(svgTemp:SVGTemplate):string {
    let midX:number = svgTemp.xMin + svgTemp.width/2;
    let midY:number = svgTemp.yMin + svgTemp.height/2;
    return "rotate(90," + midX + ","  + midY + ")";
  }

  getPanelWidth(top:boolean = true):number {
    let width:number = top ? this.sharedDataService.windowWidth : this.sharedDataService.bottomSashWidth;
    if(width <= 0) {return -1;}
    let vertDividers:number = this.sharedDataService.dividerNumbers[1];
    let finalPanelWidth:number = 0; 
    if(this.sharedDataService.selectedDividerType == 'nodiv') {
      if(width >= 100 && width <=500) {finalPanelWidth = width;}
      else {finalPanelWidth = width / (Math.ceil(width/500));}
    }
    else if(this.sharedDataService.selectedDividerType == 'embeddeddiv') {
      finalPanelWidth = width / (vertDividers+1);
      
    }
    // raised divs
    else {
      finalPanelWidth = ((width - (vertDividers*this.sharedDataService.dividerWidth)) / (vertDividers+1));
    }
    // Fixing panel width to be under 500
    if(finalPanelWidth > 500) {finalPanelWidth = finalPanelWidth / (Math.ceil(finalPanelWidth/500));}
    if(finalPanelWidth >= 100 && finalPanelWidth <= 500) {return finalPanelWidth;}
    else {return -1;}
  }

  getPanelHeight(top:boolean = true):number {
    let height:number = top ? this.sharedDataService.windowHeight : this.sharedDataService.bottomSashHeight;
    if(height <= 0) {return -1;}
    let horzDividers:number = this.sharedDataService.dividerNumbers[0];
    let finalPanelHeight:number = 0; 
    if(this.sharedDataService.selectedDividerType == 'nodiv') {
      if(height >= 100 && height <=500) {finalPanelHeight = height;}
      else {finalPanelHeight = height / (Math.ceil(height/500));}
    }
    else if(this.sharedDataService.selectedDividerType == 'embeddeddiv') {
      finalPanelHeight = height / (horzDividers+1);
    }
    // raised divs
    else {
      finalPanelHeight = ((height - (horzDividers*this.sharedDataService.dividerWidth)) / (horzDividers+1));
    }
    // Fixing panel height to be under 500
    if(finalPanelHeight >= 500) {finalPanelHeight = finalPanelHeight / (Math.ceil(finalPanelHeight/500));}
    
    if(finalPanelHeight >= 100 && finalPanelHeight <= 500) {return finalPanelHeight;}
    else {return -1;}
  }

  isRowInTopSash(rowNum:number):boolean {
    let numberTopRows:number = Math.floor(this.sharedDataService.windowHeight / this.getPanelHeight());
    if(rowNum < numberTopRows) {return true;}
    else {return false;} 
  }

  getScaleX(svgTemp:SVGTemplate, rowNum:number):number {
    return Number(svgTemp.getScaledD( ( this.isRowInTopSash(rowNum) ? this.getPanelWidth() : this.getPanelWidth(false) )/300 , ( this.isRowInTopSash(rowNum) ? this.getPanelHeight() : this.getPanelHeight(false) )/300 )[1]);
  }

  getScaleY(svgTemp:SVGTemplate, rowNum:number):number {
    return Number(svgTemp.getScaledD( ( this.isRowInTopSash(rowNum) ? this.getPanelWidth() : this.getPanelWidth(false) )/300 , ( this.isRowInTopSash(rowNum) ? this.getPanelHeight() : this.getPanelHeight(false) )/300 )[2]);
  }

  getPaneD(svgD:string, paneNum:number):string {
    let svgTemplate:SVGTemplate = new SVGTemplate(svgD);
    return svgTemplate.subShapes[paneNum+1].getScalablePath();
  }
  
}
