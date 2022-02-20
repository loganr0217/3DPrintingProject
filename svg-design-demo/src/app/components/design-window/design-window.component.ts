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

  ngOnInit(): void {
    // let newTemplate:SVGTemplate = new SVGTemplate(String(document.getElementById("svgTemplate")?.getAttribute("d")));
    // document.getElementById("svgTemplate")?.setAttribute("d", newTemplate.getOptimizedD());
    // document.getElementById("svgTemplate")?.setAttribute("style", "fill:#666666");
    // let panes:Element = document.createElementNS("http://www.w3.org/2000/svg", "path");
    // panes.setAttribute("d", newTemplate.getPanesD());
    // panes.setAttribute("style", "fill:#0000ff")
    // panes.setAttribute("id", "svgPanes");
    // document.getElementById("currentTemplate")?.appendChild(panes);
    
  }

  // Returns 0 to n-1 (mainly used for iterating svg path items)
  range(n:number=this.sharedDataService.maxPanes):number[] {
    return [...Array(n).keys()];
  }
  
  // Updates the color of the pane selected by the user (also updated the window preview)
  updateSelectedPane(paneID:number):void {
    if(this.sharedDataService.currentColor != "") {
      document.getElementById("pane"+paneID)?.setAttribute("style", "fill:#"+this.sharedDataService.currentColor);
      document.getElementById("windowPane"+this.sharedDataService.currentTemplateNumber+"_"+paneID)?.setAttribute("style", "fill:#"+this.sharedDataService.currentColor);
    }
    this.sharedDataService.currentPaneID = "pane"+paneID;
  }

}
