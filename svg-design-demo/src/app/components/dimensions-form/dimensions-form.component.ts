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

  // Method to clear old panes
  clearOldDividerPanes():void {
    let numPanes = this.sharedDataService.dividerWindow.numberHorizontalPanes * this.sharedDataService.dividerWindow.numberVerticalPanes;
    for(let i = 0; i < numPanes; ++i) {
      document.getElementById("dividerPane"+i)?.setAttribute("d", "");
      document.getElementById("dividerPane"+i)?.setAttribute("style", "")
      document.getElementById("dividerPane"+i)?.setAttribute("transform", "");
    }
  }

  // Method to update dimensions
  updateDimensions():void {
    if(this.sharedDataService.dividerWindow != null) {this.clearOldDividerPanes();}
    // Getting the user's desired width and height and divider info
    let newWidth:number = Number((<HTMLInputElement>document.getElementById("widthInput")).value);
    let newHeight:number = Number((<HTMLInputElement>document.getElementById("heightInput")).value);
    let horzDividers:number = Number((<HTMLInputElement>document.getElementById("horizontalDividersInput")).value);
    let vertDividers:number = Number((<HTMLInputElement>document.getElementById("verticalDividersInput")).value);
    let dividerWidth:number = Number((<HTMLInputElement>document.getElementById("dividerWidthInput")).value);
    let newDividerWindow:DividerWindow = new DividerWindow(newWidth, newHeight, horzDividers, vertDividers, dividerWidth, this.sharedDataService.selectedDividerType);

    // Updating template dimensions
    document.getElementById("windowPerimeter")?.setAttribute("d", newDividerWindow.dString);
    document.getElementById("windowPerimeter")?.setAttribute("style", "fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:.2;");
    let viewboxValue:string = ""+ (-6) +" "+ (-6) +" "+(newWidth+12)+" "+(newHeight+12);
    document.getElementById("dividerTemplate")?.setAttribute("viewBox", viewboxValue);

    let paneNum:number = 0;
    for(let row:number = 0; row < newDividerWindow.windowPanes.length; ++row) {
      for(let col:number = 0; col < newDividerWindow.windowPanes[row].length; ++col) {
        // Updating each individual pane
        document.getElementById("dividerPane"+paneNum)?.setAttribute("d", newDividerWindow.windowPanes[row][col].dString);
        document.getElementById("dividerPane"+paneNum)?.setAttribute("style", "fill:#FFFFFF;fill-rule:evenodd;stroke:#000000;stroke-width:.2;");
        ++paneNum;
      }
      
    }

    this.sharedDataService.dividerWindow = newDividerWindow;
  }

}
