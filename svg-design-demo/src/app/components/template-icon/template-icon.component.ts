import { HttpClient } from '@angular/common/http';
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
  templateData:{id:number, numPanels:number, panelDims:number[], tempString:string}[];

  constructor(public sharedDataService:SharedDataService, private http:HttpClient) { }

  // // Getting optimzed d for template
  // getOptimizedTemplateD(d:string):string {
  //   let myTemplate:SVGTemplate = new SVGTemplate(d);
    
  //   return myTemplate.getOptimizedD();
  // }

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

  // Clears the old window preview
  clearWindowPreview():void {
    // Not ever null
    let parent:HTMLElement = document.getElementById("windowPreviewContainerfalse")!;
    let parentFinished:HTMLElement = document.getElementById("windowPreviewContainertrue")!;
    while(parent.firstChild) {
      parent.removeChild(parent.firstChild); 
    }
    while(parentFinished.firstChild) {
      parentFinished.removeChild(parentFinished.firstChild);
    }
  }

  // Displays live window preview
  createWindowPreview(window:{id:number, name:string, d:string}[]) {
    let currentTemplate:SVGTemplate;
    let viewboxValue:string;
    
    for(let i:number = 0; i < window.length; ++i) {
      this.sharedDataService.panelColoringArray.push([]);
      currentTemplate = new SVGTemplate(window[i].d);
      viewboxValue = ""+currentTemplate.xMin+" "+currentTemplate.yMin+" "+currentTemplate.width+" "+currentTemplate.height;

      // Creating svg element
      let newSVG:Element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      newSVG.setAttribute("class", "windowSVG");
      newSVG.setAttribute("style", "overflow:visible;")
      newSVG.setAttribute("width", "100");
      newSVG.setAttribute("viewBox", viewboxValue);
      // Creating svg element for finished view
      let finishedSVG:Element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      finishedSVG.setAttribute("class", "windowSVG");
      finishedSVG.setAttribute("style", "overflow:visible;")
      finishedSVG.setAttribute("width", "100");
      finishedSVG.setAttribute("viewBox", viewboxValue);

      //newSVG.addEventListener("click");

      let numPane:number = 0; // <-- In case the outer edge is not the first element
      // Creating pane paths and adding them to svg
      for(let j = 0; j < currentTemplate.subShapes.length; ++j) {
        let newPath:Element = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let finishedPath:Element = document.createElementNS("http://www.w3.org/2000/svg", "path");
        if(j != currentTemplate.outerEdgeIndex) {
          this.sharedDataService.panelColoringArray[i].push("f0f0f1");
          newPath.setAttribute("style", "fill:#f0f0f1;");
          newPath.setAttribute("d", currentTemplate.subShapes[j].getScalablePath());
          newPath.setAttribute("id", "windowPane"+i+"_"+numPane);
          finishedPath.setAttribute("style", "fill:#f0f0f1;");
          finishedPath.setAttribute("d", currentTemplate.subShapes[j].getScalablePath());
          finishedPath.setAttribute("id", "windowPaneFinished"+i+"_"+numPane);
          ++numPane;
        }
        else {
          // Creating template path for outeredgeindex
          newPath.setAttribute("d", currentTemplate.getOptimizedD());
          newPath.setAttribute("id", "windowSVG_"+this.sharedDataService.currentWindowNumber+"_"+i)
          newPath.setAttribute("style", "fill:#"+this.sharedDataService.currentFilamentColor+";");

          finishedPath.setAttribute("d", currentTemplate.getOptimizedD());
          finishedPath.setAttribute("id", "windowSVGFinished_"+this.sharedDataService.currentWindowNumber+"_"+i)
          finishedPath.setAttribute("style", "fill:#"+this.sharedDataService.currentFilamentColor+";");
          
        }
        newSVG.appendChild(newPath);
        finishedSVG.appendChild(finishedPath);
      }
      document.getElementById("windowPreviewContainertrue")?.appendChild(finishedSVG);
      document.getElementById("windowPreviewContainerfalse")?.appendChild(newSVG);
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
        if(savedStyle != null) {document.getElementById("pane"+numPane)?.setAttribute("style", savedStyle);}
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

  nextstage4() {
    document.getElementById("stage4")?.setAttribute("style", "visibility:visible;")
    document.getElementById("stage4")?.scrollIntoView({behavior: 'auto'});
  }

  ngOnInit(): void {
    // Getting svgTemplateData
    this.svgTemplateData = this.sharedDataService.svgTemplateData;
    //   {id:0, numPanels:6, panelDims:[2,3], tempString:"0,0;0,1;0,2;0,3;0,4;0,4"},
    //   {id:1, numPanels:6, panelDims:[1,6], tempString:"0,0;0,1;0,2;0,3;0,4;0,4"},
    //   {id:2, numPanels:6, panelDims:[6,1], tempString:"0,0;0,1;0,2;0,3;0,4;0,4"},
    //   {id:3, numPanels:36, panelDims:[6,6], tempString:"0,0;0,1;0,2;0,3;0,4;0,4;0,0;0,1;0,2;0,3;0,4;0,4;0,0;0,1;0,2;0,3;0,4;0,4;0,0;0,1;0,2;0,3;0,4;0,4;0,0;0,1;0,2;0,3;0,4;0,4;0,0;0,1;0,2;0,3;0,4;0,4"},
    //   {id:4, numPanels:8, panelDims:[2,4], tempString:"1,0;1,0;1,1;1,1;1,2;1,2;1,4;1,4"}
      
    // ];
    // Getting templates from database
    this.templateData = []
    this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/templates?numberPanelsX=-1&numberPanelsY=-1").subscribe(result => {
      let tmp = JSON.parse(JSON.stringify(result));
      this.templateData = [];
      if(tmp.length >= 1) {
        // console.log(templateData);
        for(let i:number = 0; i < tmp.length; ++i) {
          let currentTmp:{id:number, numPanels:number, panelDims:number[], tempString:string} = {id:tmp[i][0], numPanels:tmp[i][1]*tmp[i][2], panelDims:[tmp[i][1], tmp[i][2]], tempString:tmp[i][3]};
          this.templateData.push(currentTmp);
        }
      }
      else {alert("error"); this.templateData = [];}
      this.sharedDataService.templateData = this.templateData;
      // console.log(this.loginForm.value);
      // console.log(this.sharedDataService.userInfo);
    });
  }

  range(i:number):number[] {
    return [...Array(i).keys()];
  }

  getPanelLayout(temp:{id:number, numPanels:number, panelDims:number[], tempString:string}):SVGTemplate[][] {
    // Creating panel layout array
    let panelLayout:SVGTemplate[][] = [];
    for(let row:number = 0; row < temp.panelDims[1]; ++row) {panelLayout.push([]);}
    
    // Splitting the tempString info into a 2d array of panel info
    let tempString:string[] = temp.tempString.split(';');
    //console.log(temp.panelDims);
    let panelInfoArray:string[][] = [];
    for(let index:number = 0; index < tempString.length; ++index) {
      panelInfoArray.push(tempString[index].split(','));
    }

    // Adding each panel to the panel layout
    for(let panelID:number = 0; panelID < panelInfoArray.length; ++panelID) {
      let panelIndex:number = this.sharedDataService.svgTemplateData[Number(panelInfoArray[panelID][0])].findIndex(function(item, i){
        return Number(item.panelNumber) == Number(panelInfoArray[panelID][1])
      });
      
      let myTemplate:SVGTemplate = new SVGTemplate(this.sharedDataService.svgTemplateData[Number(panelInfoArray[panelID][0])][panelIndex].d);
      myTemplate.numberRotations = Number(panelInfoArray[panelID][2]);
      myTemplate.flipped = Number(panelInfoArray[panelID][3]) == 1 ? true : false;
      //console.log(panelLayout[Math.floor(panelID/temp.panelDims[0])]);
      panelLayout[Math.floor(panelID/temp.panelDims[0])].push(myTemplate);
    }
    //console.log(panelLayout);
    return panelLayout;
  }

  // Creates the window previews
  createPreview(temp:{id:number, numPanels:number, panelDims:number[], tempString:string}):void {
    this.sharedDataService.panelLayout = this.getPanelLayout(temp);
    this.sharedDataService.panelLayoutDims = [this.sharedDataService.panelLayout[0].length, this.sharedDataService.panelLayout.length];
    this.sharedDataService.panelColoringArray = [];
    for(let i:number = 0; i < temp.numPanels; ++i) {
      this.sharedDataService.panelColoringArray.push([]);
      for(let j:number = 1; j < this.sharedDataService.panelLayout[Math.floor(i/this.sharedDataService.panelLayoutDims[0])][i%this.sharedDataService.panelLayoutDims[0]].subShapes.length; ++j) {
        this.sharedDataService.panelColoringArray[i].push("f0f0f1");
      }
    }
    this.sharedDataService.selectedTemplateID = temp.id;
  }
}
