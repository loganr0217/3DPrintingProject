import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { Polygon } from '../svgScaler';
import { SVGTemplate } from '../svgScaler';

@Component({
  selector: 'app-template-icon',
  templateUrl: './template-icon.component.html',
  styleUrls: ['./template-icon.component.css']
})
export class TemplateIconComponent implements OnInit {

  // Array containing the svgPath data for displaying icons / generating a template
  svgTemplateData:{id:number, name:string, d:string}[][];
  constructor(private sharedDataService:SharedDataService) { }

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

  // Clears the old window preview
  clearWindowPreview():void {
    // Not ever null
    let parent:HTMLElement = document.getElementById("windowPreviewContainer")!;
    while(parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }

  // Displays live window preview
  createWindowPreview(window:{id:number, name:string, d:string}[]) {
    let currentTemplate:SVGTemplate;
    let viewboxValue:string;
    
    for(let i:number = 0; i < window.length; ++i) {
      currentTemplate = new SVGTemplate(window[i].d);
      viewboxValue = ""+currentTemplate.xMin+" "+currentTemplate.yMin+" "+currentTemplate.width+" "+currentTemplate.height;

      // Creating svg element
      let newSVG:Element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      newSVG.setAttribute("class", "windowSVG");
      newSVG.setAttribute("style", "overflow:visible;")
      newSVG.setAttribute("width", "100");
      newSVG.setAttribute("viewBox", viewboxValue);
      //newSVG.addEventListener("click");

      let numPane:number = 0; // <-- In case the outer edge is not the first element
      // Creating pane paths and adding them to svg
      for(let j = 0; j < currentTemplate.subShapes.length; ++j) {
        let newPath:Element = document.createElementNS("http://www.w3.org/2000/svg", "path");
        if(j != currentTemplate.outerEdgeIndex) {
          newPath.setAttribute("style", "fill:#ffffff;");
          newPath.setAttribute("d", currentTemplate.subShapes[j].getScalablePath());
          newPath.setAttribute("id", "windowPane"+i+"_"+numPane);
          ++numPane;
        }
        else {
          // Creating template path for outeredgeindex
          newPath.setAttribute("d", currentTemplate.getOptimizedD());
          newPath.setAttribute("id", "windowSVG_"+this.sharedDataService.currentWindowNumber+"_"+i)
          newPath.setAttribute("style", "fill:#"+this.sharedDataService.currentFilamentColor+";");
          
        }
        newSVG.appendChild(newPath);
      }
      document.getElementById("windowPreviewContainer")?.appendChild(newSVG);
    }
  }

  // Updates current template in display window with selected version
  displayTemplate(window:{id:number, name:string, d:string}[], windowNumber:number):void {
    // Clearing the display window and windowPreview
    this.sharedDataService.currentTemplateNumber = 0; // Start at top of window
    this.sharedDataService.currentWindowNumber = windowNumber;
    this.clearOldPanes();
    this.clearWindowPreview();
    this.createWindowPreview(window);

    // Getting new template
    this.sharedDataService.currentSvgTemplate = new SVGTemplate(window[0].d);
    let newTemplate:SVGTemplate = this.sharedDataService.currentSvgTemplate;

    let numPane:number = 0; // <-- In case the outer edge is not the first element
    // Adding each individual pane
    for(let i = 0; i < newTemplate.subShapes.length; ++i) {
      if(i != newTemplate.outerEdgeIndex) {
        document.getElementById("pane"+numPane)?.setAttribute("d", newTemplate.subShapes[i].getScalablePath());
        document.getElementById("pane"+numPane)?.setAttribute("style", "fill:#ffffff");
        ++numPane;
      }
    }
    this.sharedDataService.numberPanes = numPane;
    
    // Updating the current displayed template
    if((this.sharedDataService.currentWindowNumber == 2 || this.sharedDataService.currentWindowNumber == 3)) {
      document.getElementById("svgTemplate")?.setAttribute("d", this.sharedDataService.svgTemplateData[this.sharedDataService.currentWindowNumber][0].d);
    }
    else {document.getElementById("svgTemplate")?.setAttribute("d", newTemplate.getOptimizedD());}
    
    let viewboxValue:string = ""+newTemplate.xMin+" "+newTemplate.yMin+" "+newTemplate.width+" "+newTemplate.height;
    document.getElementById("currentTemplate")?.setAttribute("viewBox", viewboxValue);
    document.getElementById("svgTemplate")?.setAttribute("transform", "");
  }

  ngOnInit(): void {
    // Getting svgTemplateData
    this.svgTemplateData = this.sharedDataService.svgTemplateData;
  }

}
