import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { Polygon } from '../svgScaler';
import { SVGTemplate } from '../svgScaler';
import { Input } from '@angular/core';

declare var $:any;

@Component({
  selector: 'app-template-icon',
  templateUrl: './template-icon.component.html',
  styleUrls: ['./template-icon.component.css']
})
export class TemplateIconComponent implements OnInit {
  @Input() flexColumn:boolean = true;
  // Array containing the svgPath data for displaying icons / generating a template
  svgTemplateData:{id:number, name:string, d:string}[][];
  templateData:{id:number, numPanels:number, panelDims:number[], tempString:string, category:string}[];
  currentTemplateIndex:number = 0;
  currentPageNumber:number = 1;
  totalPages:number;

  constructor(public sharedDataService:SharedDataService, private http:HttpClient) { }

  // // Getting optimzed d for template
  // getOptimizedTemplateD(d:string):string {
  //   let myTemplate:SVGTemplate = new SVGTemplate(d);
    
  //   return myTemplate.getOptimizedD();
  // }

  // Gets template viewbox
  getTemplateViewBox(d:string, scaleX:number=1, scaleY:number=1):string {
    let myTemplate:SVGTemplate = new SVGTemplate(d);
    let tempViewBox:string = (scaleX * myTemplate.xMin) + " " + (scaleY * myTemplate.yMin) + " " + (scaleX * myTemplate.width) + " " + (scaleY * myTemplate.height);
    return tempViewBox;
  }

  getTotalPages():number {return Math.ceil(this.sharedDataService.filteredTemplateData.length / 6);}

  decreasePageNumber():void {
    if(this.currentPageNumber > 1) {--this.currentPageNumber;}
  }

  increasePageNumber():void {
    if( !(6*this.currentPageNumber >= this.sharedDataService.filteredTemplateData.length) ) {++this.currentPageNumber;}
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
      this.sharedDataService.darkPanelColoringArray.push([]);
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
          this.sharedDataService.darkPanelColoringArray[i].push("f0f0f1");
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
    this.displayTemplate(0, 0);
  }

  // Updates current template in display window with selected version
  displayTemplate(row:number, col:number):void {
    this.clearOldPanes();
    this.sharedDataService.currentSvgTemplate = this.sharedDataService.panelLayout[0][0];
    this.sharedDataService.currentTemplateNumber = row*this.sharedDataService.panelLayoutDims[0] + col;
    let newTemplate:SVGTemplate = new SVGTemplate(this.sharedDataService.currentSvgTemplate.getOptimizedD());
    newTemplate.numberRotations = this.sharedDataService.currentSvgTemplate.numberRotations;
    newTemplate.flipped = this.sharedDataService.currentSvgTemplate.flipped;
    let transformValue = newTemplate.getTransform();

    let numPane:number = 0; // <-- In case the outer edge is not the first element
    // Adding each individual pane
    for(let i = 0; i < newTemplate.subShapes.length; ++i) {
      if(i != newTemplate.outerEdgeIndex) {
        document.getElementById("pane"+numPane)?.setAttribute("d", newTemplate.subShapes[i].getScalablePath());
        
        // Filling the pane with a saved color or blank
        let savedStyle = document.getElementById("windowPane"+this.sharedDataService.currentTemplateNumber+"_"+numPane)?.getAttribute("style");
        if(savedStyle != null) {document.getElementById("pane"+numPane)?.setAttribute("style", savedStyle);}
        else {document.getElementById("pane"+numPane)?.setAttribute("style", "fill:#f0f0f1");}
        document.getElementById("pane"+numPane)?.setAttribute("transform", transformValue);
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

  nextstage4() {
    if(window.innerWidth >= 576) {
      document.getElementById("stage4")?.setAttribute("style", "visibility:visible;")
      document.getElementById("stage4")?.scrollIntoView({behavior: 'auto'});
      this.sharedDataService.currentStepID = 5;
      if(this.sharedDataService.shoppingSectionActive) {$('#customLightscreenModal').modal('show');}
      else {$('#howToModal4').modal('show');}
      const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : 'undefined';
      this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/updatesession?sessionID="+this.sharedDataService.sessionID+"&lastStepID="+this.sharedDataService.currentStepID+"&startingURL='"+this.sharedDataService.sessionStartingUrl+"'&userEmail='"+email+"'").subscribe(result => { 
      });
    }
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
        for(let i:number = 0; i < tmp.length; ++i) {
          let currentTmp:{id:number, numPanels:number, panelDims:number[], tempString:string, category:string} = {id:tmp[i][0], numPanels:tmp[i][1]*tmp[i][2], panelDims:[tmp[i][1], tmp[i][2]], tempString:tmp[i][3], category:tmp[i][5]};
          this.templateData.push(currentTmp);
        }
      }
      else {alert("error"); this.templateData = [];}
      // this.sharedDataService.templateData = this.templateData;
    });
  }

  range(i:number):number[] {
    return [...Array(i).keys()];
  }

  
  getPanelLayout(temp:{id:number, numPanels:number, panelDims:number[], tempString:string, category:string}):SVGTemplate[][] {
    // Creating panel layout array
    let panelLayout:SVGTemplate[][] = [];
    for(let row:number = 0; row < temp.panelDims[1]; ++row) {panelLayout.push([]);}
    
    // Splitting the tempString info into a 2d array of panel info
    let tempString:string[] = temp.tempString.split(';');

    let panelInfoArray:string[][] = [];
    for(let index:number = 0; index < tempString.length; ++index) {
      panelInfoArray.push(tempString[index].split(','));
    }

    // Getting the panel information for the design
    this.sharedDataService.getPanelInfo(temp);
    
    // Adding each panel to the panel layout
    for(let panelID:number = 0; panelID < panelInfoArray.length; ++panelID) {
      let panelIndex:number = this.sharedDataService.svgTemplateData[Number(panelInfoArray[panelID][0])].findIndex(function(item, i){
        return Number(item.panelNumber) == Number(panelInfoArray[panelID][1])
      });
      
      let myTemplate:SVGTemplate = new SVGTemplate(this.sharedDataService.svgTemplateData[Number(panelInfoArray[panelID][0])][panelIndex].d);
      myTemplate.numberRotations = Number(panelInfoArray[panelID][2]);
      myTemplate.flipped = Number(panelInfoArray[panelID][3]) == 1 ? true : false;
      myTemplate.autofillString = this.sharedDataService.svgTemplateData[Number(panelInfoArray[panelID][0])][panelIndex].panelAutofillString;
      // alert(this.sharedDataService.numberTopPanels);
      if(panelID < this.sharedDataService.numberTopPanels) {
        myTemplate.scaleTemplate(this.sharedDataService.topPanelWidth/300, this.sharedDataService.topPanelHeight/300);
      } 
      else {
        myTemplate.scaleTemplate(this.sharedDataService.bottomPanelWidth/300, this.sharedDataService.bottomPanelHeight/300);
      }

      panelLayout[Math.floor(panelID/temp.panelDims[0])].push(myTemplate);
    }
    return panelLayout;
  }

  // Fills selected panel for a pane if autofill string exists
  updateColorArray():void {
    let separatedColors:string[] = this.sharedDataService.selectedPalleteColors;
    let colorIds:number[] = [];

    for(let row of this.sharedDataService.panelLayout) {
      for(let svgTemplate of row) {
        let currentAutofillString:string[] = svgTemplate.autofillString.split(",");
        for(let i:number = 0; i < currentAutofillString.length; ++i) {
          if(!colorIds.includes(Number(currentAutofillString[i]))) {colorIds.push(Number(currentAutofillString[i]));}
        }
        // console.log(currentAutofillString);
      }
    }
    colorIds = colorIds.sort();
    
    for(let colorIndex:number = 0; colorIndex < separatedColors.length; ++colorIndex) {
      let panelNumber:number = 0;
      for(let row of this.sharedDataService.panelLayout) {
        for(let svgTemplate of row) {
          let splitAutofillString:string[] = svgTemplate.autofillString.split(",");
          // alert(splitAutofillString);
          for(let i:number = 0; i < splitAutofillString.length; ++i) {
            if(Number(splitAutofillString[i]) == colorIds[colorIndex]) {
              this.sharedDataService.panelColoringArray[panelNumber][i] = separatedColors[colorIndex];
            } 
          }
          ++panelNumber;
        }
      }
    }
    
  }

  // Creates the window previews
  createPreview(temp:{id:number, numPanels:number, panelDims:number[], tempString:string, category:string}):void {
    if(this.isColorPage()) {
      for(const tempCategory of ["Artist Inspired", "Interests", "Garden", "Classics", "Sacred"]) {
        if(temp.category != undefined && temp.category.includes(tempCategory)) {(<HTMLInputElement>document.getElementById("customSwitch_"+tempCategory))!.checked = true;}
        else {(<HTMLInputElement>document.getElementById("customSwitch_"+tempCategory))!.checked = false;}
      }
    }
    this.sharedDataService.panelLayout = this.getPanelLayout(temp);
    this.sharedDataService.panelLayoutDims = [this.sharedDataService.panelLayout[0].length, this.sharedDataService.panelLayout.length];
    this.sharedDataService.panelColoringArray = [];
    this.sharedDataService.darkPanelColoringArray = [];
    for(let i:number = 0; i < temp.numPanels; ++i) {
      this.sharedDataService.panelColoringArray.push([]);
      this.sharedDataService.darkPanelColoringArray.push([]);
      for(let j:number = 1; j < this.sharedDataService.panelLayout[Math.floor(i/this.sharedDataService.panelLayoutDims[0])][i%this.sharedDataService.panelLayoutDims[0]].subShapes.length; ++j) {
        this.sharedDataService.panelColoringArray[i].push("f0f0f1");
        this.sharedDataService.darkPanelColoringArray[i].push("f0f0f1");
      }
    }
    this.sharedDataService.selectedTemplateID = temp.id;
    // Multi click for tdi
    if(this.isColorPage()) {
      if(this.sharedDataService.selectedTemplateIDs.indexOf(temp.id) > -1) {this.sharedDataService.selectedTemplateIDs.splice(this.sharedDataService.selectedTemplateIDs.indexOf(temp.id), 1);}
      else {this.sharedDataService.selectedTemplateIDs.push(temp.id);}
    }
    
  }

  getSVGIconWidth():string {
    let iconWidth:number = 18 / this.sharedDataService.panelLayoutDims[0];
    let final:string = "width:" + iconWidth.toString() + "vw;";
    return final;
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

  isTemplateOkay(temp:{id:number, numPanels:number, panelDims:number[], tempString:string, category:string}):boolean {
    let isOkay:boolean = true;
    if(!this.isColorPage()) {
      if(temp.category != undefined && this.sharedDataService.selectedTemplateCategory.includes(temp.category)) {isOkay = true;}
      else {isOkay = false; return false;}
    }
    else {
      if((temp.category == undefined || temp.category == "") && (this.sharedDataService.selectedTemplateCategory == undefined || this.sharedDataService.selectedTemplateCategory == "unassigned")) {isOkay = true;}
      else if(temp.category != undefined && this.sharedDataService.selectedTemplateCategory.includes(temp.category)) {isOkay = true;}
      else {isOkay = false; return false;}
    }
    if(temp.tempString == "-1") {return false;}
    // Splitting the tempString info into a 2d array of panel info
    let tempString:string[] = temp.tempString.split(';');
    let panelInfoArray:string[][] = [];
    for(let index:number = 0; index < tempString.length; ++index) {
      panelInfoArray.push(tempString[index].split(','));
    }

    let rowNumber:number = -1;
    // Adding each panel to the panel layout
    for(let panelID:number = 0; panelID < panelInfoArray.length; ++panelID) {
      if(panelID % temp.panelDims[0] == 0) {++rowNumber;}

      // Check for templates with -1 panelset selected
      if(Number(panelInfoArray[panelID][0]) == -1) {return false;}
      
      let panelIndex:number = this.sharedDataService.svgTemplateData[Number(panelInfoArray[panelID][0])].findIndex(function(item, i){
        return Number(item.panelNumber) == Number(panelInfoArray[panelID][1]);
      });
      // console.log(panelIndex);
      
      if(this.sharedDataService.svgTemplateData[Number(panelInfoArray[panelID][0])][panelIndex] == undefined) {isOkay = false; break;}
      let myTemplate:SVGTemplate = new SVGTemplate(this.sharedDataService.svgTemplateData[Number(panelInfoArray[panelID][0])][panelIndex].d);
      myTemplate.numberRotations = Number(panelInfoArray[panelID][2]);
      myTemplate.flipped = Number(panelInfoArray[panelID][3]) == 1 ? true : false;
      if(myTemplate.getScaledD( ( this.isRowInTopSash(rowNumber) ? this.getPanelWidth() : this.getPanelWidth(false) )/300 , ( this.isRowInTopSash(rowNumber) ? this.getPanelHeight() : this.getPanelHeight(false) )/300 )[0].includes("NaN")) {isOkay = false; break;}
      
      //panelLayout[Math.floor(panelID/temp.panelDims[0])].push(myTemplate);
    }
    if(isOkay) {this.sharedDataService.templatesAvailable = true;}
    return isOkay;
  }

  // Checking whether it is the color page (TDI)
  isColorPage():boolean {
    return document.URL.includes("windowCreation");
  }

  isMobile():boolean {
    return window.innerWidth <= 576;
  }

  checkForAvailableTemplates():boolean {
    let isAvailable:boolean = false;
    for(let template of this.templateData) {
      if((template.panelDims[0] == this.sharedDataService.panelLayoutDims[0] 
        && template.panelDims[1] == this.sharedDataService.panelLayoutDims[1]
        && this.isTemplateOkay(template))) {isAvailable = true;}
    }
    return isAvailable;
  }

  getPaneStyle(paneNum:number, autoString:string[]):string {
    let autoStringPossibilities:string[] = [];
    for(let i:number = 0; i < autoString.length; ++i) {
      if(autoStringPossibilities.indexOf(autoString[i]) == -1) {autoStringPossibilities.push(autoString[i]);}
    }
    autoStringPossibilities.sort();
    if(this.sharedDataService.selectedPalleteColors.length > autoStringPossibilities.indexOf(autoString[paneNum])) {return 'fill:#' + this.sharedDataService.selectedPalleteColors[autoStringPossibilities.indexOf(autoString[paneNum])];}
    return 'fill:#ffffff';
  } 
}
