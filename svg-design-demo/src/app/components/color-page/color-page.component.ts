import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { SVGTemplate } from '../svgScaler';
@Component({
  selector: 'app-color-page',
  templateUrl: './color-page.component.html',
  styleUrls: ['./color-page.component.css']
})
export class ColorPageComponent implements OnInit {
  // Array containing the svgPath data for displaying icons / generating a template
  svgTemplateData:{id:number, name:string, d:string}[][];
  currentPanel:number;
  currentWindow:{id:number, name:string, d:string}[];
  panelLayout:SVGTemplate[][];
  panelDims:number[];
  currentPanelLocation:number[];
  constructor(private sharedDataService:SharedDataService) { }

  // Getting optimzed d for template
  getOptimizedTemplateD(d:string):string {
    let myTemplate:SVGTemplate = new SVGTemplate(d);
    return myTemplate.getOptimizedD();
  }

  // Gets template viewbox
  getTemplateViewBox(d:string):string {
    let myTemplate:SVGTemplate = new SVGTemplate(d);
    let tempViewBox:string = myTemplate.xMin + " " + myTemplate.yMin + " " + myTemplate.width + " " + myTemplate.height;
    return tempViewBox;
  }

  // Gets template width
  getTemplateWidth(d:string):string {
    let myTemplate:SVGTemplate = new SVGTemplate(d);
    return String(myTemplate.width);
  }

  // Gets template height
  getTemplateHeight(d:string):string {
    let myTemplate:SVGTemplate = new SVGTemplate(d);
    return String(myTemplate.height);
  }

  displayTemplate(window:{id:number, name:string, d:string}[], windowNumber:number):void {
    this.currentWindow = window;

  }

  choosePanel(panelNum:number):void {
    if(this.currentPanel != null) {
      document.getElementById("svgTemplateLayoutPanel" + this.currentPanel)?.setAttribute("style", "fill:#666666;")
    }
    document.getElementById("svgTemplateLayoutPanel" + panelNum)?.setAttribute("style", "fill:#e6e6e6;")
    this.currentPanel = panelNum;
    this.panelLayout[this.currentPanelLocation[0]][this.currentPanelLocation[1]] = new SVGTemplate(this.currentWindow[panelNum].d);
    if(this.currentPanelLocation[1] + 1 >= this.panelDims[0]) {++this.currentPanelLocation[0]; this.currentPanelLocation[1]=0;}
    else {++this.currentPanelLocation[1];}
  }

  updateLayout():void {
    let leftRight:number = Number((<HTMLInputElement>document.getElementById("leftRightInput")).value)
    let topBottom:number = Number((<HTMLInputElement>document.getElementById("topBottomInput")).value)
    if(leftRight != null && topBottom != null && leftRight > 0 && topBottom > 0) {
      this.panelLayout = [];
      for(let i:number = 0; i < topBottom; ++i) {
        this.panelLayout.push([]);
      }
      document.getElementById("currentLayoutText")!.textContent = "Current Layout: " + leftRight + "x" + topBottom; 
      this.currentPanelLocation = [0, 0];
      document.getElementById("currentPanelIndexText")!.textContent = "Current Panel Location: " + this.currentPanelLocation; 
      this.panelDims = [leftRight, topBottom];
    }
    
  }

  ngOnInit(): void {
    this.svgTemplateData = this.sharedDataService.svgTemplateData;
  }

}
