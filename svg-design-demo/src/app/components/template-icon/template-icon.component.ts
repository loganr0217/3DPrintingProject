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
  svgTemplateData:{id:number, name:string, d:string}[];
  constructor(private sharedDataService:SharedDataService) { }

  // Method to clear old panes
  clearOldPanes():void {
    let numPanes = this.sharedDataService.numberPanes;
    for(let i = 0; i < numPanes; ++i) {
      document.getElementById("pane"+i)?.setAttribute("d", "");
      document.getElementById("pane"+i)?.setAttribute("style", "");
    }
    this.sharedDataService.numberPanes = 0;
  }

  // Updates current template in display window with selected version
  displayTemplate(svgD:string):void {
    this.clearOldPanes();
    this.sharedDataService.currentSvgTemplate = new SVGTemplate(svgD);
    let newTemplate:SVGTemplate = this.sharedDataService.currentSvgTemplate;

    let numPane:number = 0; // <-- In case the outer edge is not the first element
    // Adding each individual pane
    for(let i = 0; i < newTemplate.subShapes.length; ++i) {
      if(i != newTemplate.outerEdgeIndex) {
        // let newPane:Element = document.createElementNS("http://www.w3.org/2000/svg", "path");
        
        document.getElementById("pane"+numPane)?.setAttribute("d", newTemplate.subShapes[i].getScalablePath());
        //document.getElementById("pane"+numPane)?.setAttribute("id", "pane"+numPane);
        document.getElementById("pane"+numPane)?.setAttribute("style", "fill:#ffffff");
        document.getElementById("pane"+numPane)?.setAttribute("onclick", "updateSelectedPane(pane"+numPane+")");
        //document.getElementById("currentTemplate")?.appendChild(newPane);
        ++numPane;
      }
    }
    this.sharedDataService.numberPanes = numPane;

    // Updating the current displayed template
    document.getElementById("svgTemplate")?.setAttribute("d", newTemplate.getOptimizedD());
    document.getElementById("svgTemplate")?.setAttribute("width", ""+newTemplate.width+"mm");
    document.getElementById("svgTemplate")?.setAttribute("height", ""+newTemplate.height+"mm");
    let viewboxValue:string = ""+newTemplate.xMin+" "+newTemplate.yMin+" "+newTemplate.width+" "+newTemplate.height;
    document.getElementById("svgTemplate")?.setAttribute("viewBox", viewboxValue);
    // document.getElementById("currentTemplate")?.setAttribute("width", ""+newTemplate.width+"mm");
    // document.getElementById("currentTemplate")?.setAttribute("height", ""+newTemplate.height+"mm");
    document.getElementById("currentTemplate")?.setAttribute("viewBox", viewboxValue);
  }

  ngOnInit(): void {
    // Getting svgTemplateData
    this.svgTemplateData = this.sharedDataService.svgTemplateData;
  }

}
