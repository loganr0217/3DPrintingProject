import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { Polygon } from '../svgScaler';
import { SVGTemplate } from '../svgScaler';

@Component({
  selector: 'app-design-window',
  templateUrl: './design-window.component.html',
  styleUrls: ['./design-window.component.css']
})
export class DesignWindowComponent implements OnInit {
  constructor(private sharedDataService:SharedDataService) { }

  // Queue-like array to hold changes
  recentChanges:string[][];
  undoQueueSize:number = 10;
  ngOnInit(): void {
    // let newTemplate:SVGTemplate = new SVGTemplate(String(document.getElementById("svgTemplate")?.getAttribute("d")));
    // document.getElementById("svgTemplate")?.setAttribute("d", newTemplate.getOptimizedD());
    // document.getElementById("svgTemplate")?.setAttribute("style", "fill:#666666");
    // let panes:Element = document.createElementNS("http://www.w3.org/2000/svg", "path");
    // panes.setAttribute("d", newTemplate.getPanesD());
    // panes.setAttribute("style", "fill:#0000ff")
    // panes.setAttribute("id", "svgPanes");
    // document.getElementById("currentTemplate")?.appendChild(panes);
    this.recentChanges = [];
  }

  // Returns 0 to n-1 (mainly used for iterating svg path items)
  range(n:number=this.sharedDataService.maxPanes):number[] {
    return [...Array(n).keys()];
  }
  
  // Updates the color of the pane selected by the user (also updated the window preview)
  updateSelectedPane(paneID:number):void {
    let previousStyle:string = String(document.getElementById("pane"+paneID)?.getAttribute("style"));
    if(this.recentChanges.length < this.undoQueueSize) {this.recentChanges.push([String(this.sharedDataService.currentTemplateNumber), String(paneID), previousStyle]);}
    else {this.recentChanges.shift(); this.recentChanges.push([String(this.sharedDataService.currentTemplateNumber), String(paneID), previousStyle]);}
    if(this.sharedDataService.currentPaneColor != "") {
      document.getElementById("pane"+paneID)?.setAttribute("style", "fill:#"+this.sharedDataService.currentPaneColor);
      document.getElementById("windowPane"+this.sharedDataService.currentTemplateNumber+"_"+paneID)?.setAttribute("style", "fill:#"+this.sharedDataService.currentPaneColor);
      document.getElementById("windowPaneFinished"+this.sharedDataService.currentTemplateNumber+"_"+paneID)?.setAttribute("style", "fill:#"+this.sharedDataService.currentPaneColor);
      this.sharedDataService.panelColoringArray[this.sharedDataService.currentTemplateNumber][paneID] = this.sharedDataService.currentPaneColor;
    }
    this.sharedDataService.currentPaneID = "pane"+paneID;
  }

  // Undoes the last change recent changes array : [templateNum, paneID, style]
  undoChange():void {
    if(this.recentChanges.length > 0) {

      let recentChange:string[] = this.recentChanges.pop()!;
      if(recentChange[0] == String(this.sharedDataService.currentTemplateNumber)) {
        document.getElementById("pane"+recentChange[1])?.setAttribute("style", recentChange[2]);
      }
      this.sharedDataService.panelColoringArray[Number(recentChange[0])][Number(recentChange[1])] = recentChange[2].substring(6);
      document.getElementById("windowPane"+recentChange[0]+"_"+recentChange[1])?.setAttribute("style", recentChange[2]);
      document.getElementById("windowPaneFinished"+recentChange[0]+"_"+recentChange[1])?.setAttribute("style", recentChange[2]);

      
    }
    

  }
  
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

    displayFirstTemplate():void {
      this.displayTemplate(this.sharedDataService.panelLayout[0][0].getOptimizedD(), 0, 0);
    }

    // Updates current template in display window with selected version
    displayTemplate(svgD:string, row:number, col:number):void {
      this.clearOldPanes();
      this.sharedDataService.currentSvgTemplate = new SVGTemplate(svgD);
      this.sharedDataService.currentTemplateNumber = row*this.sharedDataService.panelLayoutDims[0] + col;
      let newTemplate:SVGTemplate = this.sharedDataService.currentSvgTemplate;

      let numPane:number = 0; // <-- In case the outer edge is not the first element
      // Adding each individual pane
      for(let i = 0; i < newTemplate.subShapes.length; ++i) {
        if(i != newTemplate.outerEdgeIndex) {
          document.getElementById("pane"+numPane)?.setAttribute("d", newTemplate.subShapes[i].getScalablePath());
          
          // Filling the pane with a saved color or blank
          let savedStyle = document.getElementById("windowPane"+this.sharedDataService.currentTemplateNumber+"_"+numPane)?.getAttribute("style");
          if(savedStyle != null) {document.getElementById("pane"+numPane)?.setAttribute("style", "fill:#"+savedStyle.substring(6));}
          else {document.getElementById("pane"+numPane)?.setAttribute("style", "fill:#f0f0f1");}
          ++numPane;
        }
      }
      this.sharedDataService.numberPanes = numPane;

      
      // Updating the current displayed template
      document.getElementById("svgTemplate")?.setAttribute("d", newTemplate.getOptimizedD());

      let viewboxValue:string = ""+newTemplate.xMin+" "+newTemplate.yMin+" "+newTemplate.width+" "+newTemplate.height;
      document.getElementById("currentTemplate")?.setAttribute("viewBox", viewboxValue);
      document.getElementById("svgTemplate")?.setAttribute("transform", "");
      // document.getElementById("currentTemplate")?.setAttribute("width", ""+newTemplate.width+"mm");
      // document.getElementById("currentTemplate")?.setAttribute("height", ""+newTemplate.height+"mm");
    }

    nextstage5() {
      document.getElementById("stage5")?.setAttribute("style", "visibility:visible;")
      document.getElementById("stage5")?.scrollIntoView({behavior: 'smooth'});
    }

    previousStage() {
      document.getElementById("templateCategoryStage")?.scrollIntoView({behavior: 'smooth'});
    }

    // Changes color of frame
    changeFrameColor(hexValue:string):void {
      document.getElementById("button_"+this.sharedDataService.currentFilamentColor+"_false")?.setAttribute("style", "");
      document.getElementById("button_"+hexValue+"_false")?.setAttribute("style", "border:1px solid #0000ff");
      this.sharedDataService.currentFilamentColor = hexValue;
      document.getElementById("svgTemplate")?.setAttribute("style", "fill:#"+this.sharedDataService.currentFilamentColor);
      for(let i = 0; i < this.sharedDataService.panelLayoutDims[0]*this.sharedDataService.panelLayoutDims[1]; ++i) {
        document.getElementById("windowSVG"+i)?.setAttribute("style", "fill:#"+this.sharedDataService.currentFilamentColor+";");
        document.getElementById("windowSVGFinished"+i)?.setAttribute("style", "fill:#"+this.sharedDataService.currentFilamentColor+";");
      }
    }
}
