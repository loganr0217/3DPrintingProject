import { HttpClient } from '@angular/common/http';
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
  svgTemplateData:{id:number, name:string, panelNumber:number, d:string}[][];
  currentPanel:number;
  currentWindow:{id:number, name:string, panelNumber:number, d:string}[];
  panelLayout:SVGTemplate[][];
  panelDims:number[];
  currentPanelLocation:number[];
  templateString:string;
  panelSetId:number;
  panelNumber:number;
  onPanels:boolean;
  constructor(public sharedDataService:SharedDataService, private http:HttpClient) { }

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

  displayTemplate(window:{id:number, name:string, panelNumber:number, d:string}[], windowNumber:number):void {
    this.currentWindow = window;
    this.sharedDataService.currentWindowNumber = windowNumber;
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

  // Updates current template in display window with selected version
  displayPanel(svgD:string, row:number, col:number):void {
    this.sharedDataService.panelColoringArray = [[]];
    this.clearOldPanes();
    this.sharedDataService.currentSvgTemplate = new SVGTemplate(svgD);
    this.sharedDataService.currentTemplateNumber = 0; // ******* Only for color page *********
    let newTemplate:SVGTemplate = this.sharedDataService.currentSvgTemplate;

    let numPane:number = 0; // <-- In case the outer edge is not the first element
    // Adding each individual pane
    for(let i = 0; i < newTemplate.subShapes.length; ++i) {
      if(i != newTemplate.outerEdgeIndex) {
        document.getElementById("pane"+numPane)?.setAttribute("d", newTemplate.subShapes[i].getScalablePath());
        this.sharedDataService.panelColoringArray[0].push("f0f0f1");
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

  choosePanel(panelNum:number):void {
    // alert(panelNum);
    this.templateString += this.sharedDataService.currentWindowNumber + "," + panelNum + ",0,0;";
    this.panelSetId = this.sharedDataService.currentWindowNumber;
    this.panelNumber = panelNum;
    // if(this.currentPanel != null) {
    //   document.getElementById("svgTemplateLayoutPanel" + this.currentPanel)?.setAttribute("style", "fill:#666666;")
    // }
    // document.getElementById("svgTemplateLayoutPanel" + panelNum)?.setAttribute("style", "fill:#e6e6e6;")
    this.currentPanel = panelNum;
    let panelIndex:number = this.currentWindow.findIndex(function(item, i){
      return Number(item.panelNumber) == panelNum
    });
    this.panelLayout[this.currentPanelLocation[0]][this.currentPanelLocation[1]] = new SVGTemplate(this.currentWindow[panelIndex].d);
    if(this.currentPanelLocation[1] + 1 >= this.panelDims[0]) {++this.currentPanelLocation[0]; this.currentPanelLocation[1]=0;}
    else {++this.currentPanelLocation[1];}
    document.getElementById("currentPanelIndexText")!.textContent = "Current Panel Location: " + this.currentPanelLocation; 
  }

  updateLayout():void {
    this.templateString = "";
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
      this.sharedDataService.panelLayoutDims = [leftRight, topBottom];
    }
    
  }

  // Method to remove the last selected panel in the TDI
  undoPanelChoice():void {
    if(this.currentPanelLocation[1] - 1 < 0 && this.currentPanelLocation[0] - 1 >= 0) {--this.currentPanelLocation[0]; this.currentPanelLocation[1]=this.panelDims[0]-1;}
    else {--this.currentPanelLocation[1];}
    this.panelLayout[this.currentPanelLocation[0]].pop();
    document.getElementById("currentPanelIndexText")!.textContent = "Current Panel Location: " + this.currentPanelLocation; 
    let test:string[] = this.templateString.split(";");
    // Removing empty ending and last panel
    test.pop();
    test.pop();
    this.templateString = test.join(";") + ";";
    if(this.templateString == ";") {this.templateString = "";}
  }

  ngOnInit(): void {
    this.svgTemplateData = this.sharedDataService.svgTemplateData;
    this.templateString = "";
    this.panelSetId = -1;
    this.panelNumber = -1;
    this.onPanels = true;
  }

  showTemplateString():void {
    alert(this.templateString.substring(0, this.templateString.length-1));
  }

  // Method to decrease current panel location
  decreaseCurrentLocation():void {
    // Decreasing the current location by 1
    if(this.currentPanelLocation[1] - 1 < 0 && this.currentPanelLocation[0] - 1 >= 0) {--this.currentPanelLocation[0]; this.currentPanelLocation[1]=this.panelDims[0]-1;}
    else {--this.currentPanelLocation[1];}
  }

  // Method to increase current panel location
  increaseCurrentLocation():void {
    // Increasing the current location by 1
    if(this.currentPanelLocation[1] + 1 >= this.panelDims[0]) {++this.currentPanelLocation[0]; this.currentPanelLocation[1]=0;}
    else {++this.currentPanelLocation[1];}
  }

  // Method to rotate the last placed panel 90 degrees
  rotateLastPanel():void {
    // Decreasing the current location by 1
    this.decreaseCurrentLocation();
    this.panelLayout[this.currentPanelLocation[0]][this.currentPanelLocation[1]].numberRotations += 1;
    this.panelLayout[this.currentPanelLocation[0]][this.currentPanelLocation[1]].numberRotations %= 4;
    let test:string[] = this.templateString.split(";");
    // Removing empty ending and adding number of rotations to last panel
    test.pop();
    // console.log(test);
    let lastPanelString:string[] = test[test.length-1].split(",");
    // let lastPanelInfo:string[] = test[test.length-1].split(",");
    // if(lastPanelInfo.length > 2) {lastPanelInfo[2] = String(this.panelLayout[this.currentPanelLocation[0]][this.currentPanelLocation[1]].numberRotations);}
    // else {lastPanelInfo.push(String(this.panelLayout[this.currentPanelLocation[0]][this.currentPanelLocation[1]].numberRotations));}
    lastPanelString[2] = String((Number(lastPanelString[2]) + 1) % 4);
    // console.log(lastPanelString);
    test[test.length-1] = lastPanelString.join(",");
    this.templateString = test.join(";") + ";";
    if(this.templateString == ";") {this.templateString = "";}
    this.increaseCurrentLocation();
  }

  // Method to mirror the last placed panel
  mirrorLastPanel():void {
    // Decreasing the current location by 1
    this.decreaseCurrentLocation();
    this.panelLayout[this.currentPanelLocation[0]][this.currentPanelLocation[1]].flipped = !this.panelLayout[this.currentPanelLocation[0]][this.currentPanelLocation[1]].flipped;
    let test:string[] = this.templateString.split(";");
    // Removing empty ending and adding number of rotations to last panel
    test.pop();
    // console.log(test);
    let lastPanelString:string[] = test[test.length-1].split(",");
    // let lastPanelInfo:string[] = test[test.length-1].split(",");
    // if(lastPanelInfo.length > 2) {lastPanelInfo[2] = String(this.panelLayout[this.currentPanelLocation[0]][this.currentPanelLocation[1]].numberRotations);}
    // else {lastPanelInfo.push(String(this.panelLayout[this.currentPanelLocation[0]][this.currentPanelLocation[1]].numberRotations));}
    lastPanelString[3] = String((Number(lastPanelString[3]) + 1) % 2);
    // console.log(lastPanelString);
    test[test.length-1] = lastPanelString.join(",");
    this.templateString = test.join(";") + ";";
    if(this.templateString == ";") {this.templateString = "";}
    this.increaseCurrentLocation();
  }

  // Method to get the autofill text for a panel
  getPanelAutofillString():void {
    // console.log("here: " + this.sharedDataService.panelColoringArray[0]);
    let colorArray:string[] = this.sharedDataService.panelColoringArray[0];
    
    let colorNumberArray:number[] = [];
    for(let i:number = 0; i < colorArray.length; ++i) {
      let foundColor:{ id: number; name: string; hex: string; paneColor: boolean; }[] = this.sharedDataService.colorsData.filter(function(item) { return item.hex == colorArray[i]; });
      if(foundColor.length > 0) {colorNumberArray.push(foundColor[0].id);}
      else {colorNumberArray.push(3);}
    }
    const panelAutofillString:string = colorNumberArray.join(",");
    const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : "";
    const password:string = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[4] : "";
    const panelsetId:number = this.panelSetId;
    const panelNumber:number = this.panelNumber;
    if (confirm('Are you sure you want to add this autofill string: ' + panelAutofillString + " ?")) {
      this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/addpanelautofillstring?email='"+email+"'&password='"+password+ "'&panelAutofillString='" + panelAutofillString + "'&panelSetId=" + panelsetId + "&panelNumber=" + panelNumber).subscribe(result => {
        let test = JSON.stringify(result).split('[').join("").split(']').join("").split('"').join("").split(",");
        alert(test);
        // console.log(this.loginForm.value);
        // console.log(this.sharedDataService.userInfo);
       });
    }
  }

  addTemplate():void {
    const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : "";
    const password:string = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[4] : "";
    const numberPanelsX:number = this.panelDims[0];
    const numberPanelsY:number = this.panelDims[1];
    const templateString:string = this.templateString.substring(0, this.templateString.length-1);
    if (confirm('Are you sure you want to add this template?')) {
      this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/addtemplate?email='"+email+"'&password='"+password+"'&numberPanelsX=" + numberPanelsX + "&numberPanelsY=" + numberPanelsY + "&templateString='" + templateString + "'&access='public'").subscribe(result => {
        let test = JSON.stringify(result).split('[').join("").split(']').join("").split('"').join("").split(",");
        alert(test);
        // console.log(this.loginForm.value);
        // console.log(this.sharedDataService.userInfo);
       });
    }
    

  }

  getTemplatePanelSwitchText():string {
    if(this.onPanels) {return "Switch to Template Autofill";}
    else {return "Switch to Panel Autofill";}
  }

  switchTemplatePanel():void {this.onPanels = !this.onPanels;}

  getTemplateAutofillString():void {
    // console.log("here: " + this.sharedDataService.panelColoringArray[0]);
    let colorArray:string[][] = this.sharedDataService.panelColoringArray;
    let colorNumberArray:number[][] = [];
    let colorNumberArrayTmp:number[];
    for(let panelNum:number = 0; panelNum < colorArray.length; ++panelNum) {
      colorNumberArrayTmp = [];
      for(let i:number = 0; i < colorArray[panelNum].length; ++i) {
        let foundColor:{ id: number; name: string; hex: string; paneColor: boolean; }[] = this.sharedDataService.colorsData.filter(function(item) { return item.hex == colorArray[panelNum][i]; });
        if(foundColor.length > 0) {colorNumberArrayTmp.push(foundColor[0].id);}
        else {colorNumberArrayTmp.push(3);}
      }
      colorNumberArray.push(colorNumberArrayTmp);
    }
    
    const templateAutofillString:string = colorNumberArray.join(";");
    const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : "";
    const password:string = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[4] : "";
    const panelsetId:number = this.panelSetId;
    const panelNumber:number = this.panelNumber;
    alert(templateAutofillString);
    // if (confirm('Are you sure you want to add this autofill string: ' + panelAutofillString + " ?")) {
    //   this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/addpanelautofillstring?email='"+email+"'&password='"+password+ "'&panelAutofillString='" + panelAutofillString + "'&panelSetId=" + panelsetId + "&panelNumber=" + panelNumber).subscribe(result => {
    //     let test = JSON.stringify(result).split('[').join("").split(']').join("").split('"').join("").split(",");
    //     alert(test);
    //     // console.log(this.loginForm.value);
    //     // console.log(this.sharedDataService.userInfo);
    //    });
    // }
  }

}
