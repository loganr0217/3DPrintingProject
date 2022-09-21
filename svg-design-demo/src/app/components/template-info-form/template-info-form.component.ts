import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { Polygon, SVGTemplate, DividerWindow, WindowPane } from '../svgScaler';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-template-info-form',
  templateUrl: './template-info-form.component.html',
  styleUrls: ['./template-info-form.component.css']
})
export class TemplateInfoFormComponent implements OnInit {

  // Array containing the svgPath data for displaying icons / generating a template
  svgTemplateData:{id:number, name:string, d:string}[][];
  constructor(private sharedDataService:SharedDataService, private http:HttpClient) { }

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
  createWindowPreview() {
    let window:{d:string, priority:string}[] = this.sharedDataService.window;
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
          newPath.setAttribute("id", "windowSVG_"+"_"+i)
          
        }
        newSVG.appendChild(newPath);
      }
      document.getElementById("windowPreviewContainer")?.appendChild(newSVG);
    }
  }

  // Updates current template in display window with selected version
  displayTemplate():void {
    this.sharedDataService.currentTemplateNumber = 0; // Start at top of window
    let window:{d:string, priority:string}[] = this.sharedDataService.window;
    // Clearing the display window and windowPreview
    this.clearOldPanes();
    this.clearWindowPreview();
    this.createWindowPreview();

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
    document.getElementById("svgTemplate")?.setAttribute("d", newTemplate.getOptimizedD());
    
    let viewboxValue:string = ""+newTemplate.xMin+" "+newTemplate.yMin+" "+newTemplate.width+" "+newTemplate.height;
    document.getElementById("currentTemplate")?.setAttribute("viewBox", viewboxValue);
    document.getElementById("svgTemplate")?.setAttribute("transform", "");
  }

  addPanel():void {
    const headers = { 'content-type': 'application/json'}  
    const body=JSON.stringify(
      {
        'email':this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : "",
        'password':this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[4] : "",
        'panelSetId':Number((<HTMLInputElement>document.getElementById("panelSetIdInput"))?.value),
        'panelNumber':Number((<HTMLInputElement>document.getElementById("panelNumberInput"))?.value),
        'panelName':(<HTMLInputElement>document.getElementById("nameInput"))?.value+"_"+Number((<HTMLInputElement>document.getElementById("panelNumberInput"))?.value),
        'dAttribute':(<HTMLInputElement>document.getElementById("dInput"))?.value
      });
    const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : "";
    const password:string = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[4] : "";
    const panelSetId:number = Number((<HTMLInputElement>document.getElementById("panelSetIdInput"))?.value);
    const panelNumber:number = Number((<HTMLInputElement>document.getElementById("panelNumberInput"))?.value);
    const panelName:string = (<HTMLInputElement>document.getElementById("nameInput"))?.value + "_" + panelNumber;
    const dAttribute:string = (<HTMLInputElement>document.getElementById("dInput"))?.value;

    if (confirm('Are you sure you want to add this panel?')) {
      // this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/addpanel?email='"+email+"'&password='"+password+"'&panelSetId=" + panelSetId + "&panelNumber=" + panelNumber + "&panelName='" + panelName + "'&dAttribute='" + dAttribute + "'").subscribe(result => {
      //   let test = JSON.stringify(result).split('[').join("").split(']').join("").split('"').join("").split(",");
      //   alert(test);
      //   // console.log(this.loginForm.value);
      //   // console.log(this.sharedDataService.userInfo);
      //  });
       this.http.post("https://backend-dot-lightscreendotart.uk.r.appspot.com/addpanel", body, {'headers':headers}).subscribe(result => {
        let test = JSON.stringify(result).split('[').join("").split(']').join("").split('"').join("").split(",");
         alert(test);
         let newPanel:{id:number, name:string, panelNumber:number, d:string, panelAutofillString:string} = {
          id:Number((<HTMLInputElement>document.getElementById("panelSetIdInput"))?.value),
          name:(<HTMLInputElement>document.getElementById("nameInput"))?.value+"_"+Number((<HTMLInputElement>document.getElementById("panelNumberInput"))?.value),
          panelNumber:Number((<HTMLInputElement>document.getElementById("panelNumberInput"))?.value),
          d:(<HTMLInputElement>document.getElementById("dInput"))?.value,
          panelAutofillString:""
        }
       });;
    }
    

  }

  updatePanel():void {
    const headers = { 'content-type': 'application/json'}  
    const body=JSON.stringify(
      {
        'email':this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : "",
        'password':this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[4] : "",
        'panelSetId':this.sharedDataService.currentWindowNumber,
        'panelNumber':this.sharedDataService.chosenPanel.panelNumber,
        'panelName':(<HTMLInputElement>document.getElementById("nameInput"))?.value+"_"+this.sharedDataService.chosenPanel.panelNumber,
        'dAttribute':(<HTMLInputElement>document.getElementById("dInput"))?.value
      });
    const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : "";
    const password:string = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[4] : "";
    const panelSetId:number = this.sharedDataService.currentWindowNumber;
    const panelNumber:number = this.sharedDataService.chosenPanel.panelNumber;
    const panelName:string = (<HTMLInputElement>document.getElementById("nameInput"))?.value+"_"+Number((<HTMLInputElement>document.getElementById("panelNumberInput"))?.value);
    const dAttribute:string = (<HTMLInputElement>document.getElementById("dInput"))?.value;

    let confirmText:string = "Previous:\n- Panelset Id: " + panelSetId + "\n- Panel Number: " + panelNumber + 
    "\n- Panel Name: " + this.sharedDataService.chosenPanel.name + "\n" +
    "New:\n- Panelset Id: " + panelSetId + "\n- Panel Number: " + panelNumber + 
    "\n- Panel Name: " + (<HTMLInputElement>document.getElementById("nameInput"))?.value+"_"+this.sharedDataService.chosenPanel.panelNumber + "\n";
    if (confirm('Are you sure you want to update this panel?\n' + confirmText)) {
      // this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/addpanel?email='"+email+"'&password='"+password+"'&panelSetId=" + panelSetId + "&panelNumber=" + panelNumber + "&panelName='" + panelName + "'&dAttribute='" + dAttribute + "'").subscribe(result => {
      //   let test = JSON.stringify(result).split('[').join("").split(']').join("").split('"').join("").split(",");
      //   alert(test);
      //   // console.log(this.loginForm.value);
      //   // console.log(this.sharedDataService.userInfo);
      //  });
       this.http.post("https://backend-dot-lightscreendotart.uk.r.appspot.com/updatepanel", body, {'headers':headers}).subscribe(result => {
        let test = JSON.stringify(result).split('[').join("").split(']').join("").split('"').join("").split(",");
         alert(test);
         this.sharedDataService.chosenPanel.name = (<HTMLInputElement>document.getElementById("nameInput"))?.value+"_"+this.sharedDataService.chosenPanel.panelNumber;
         this.sharedDataService.chosenPanel.d = (<HTMLInputElement>document.getElementById("dInput"))?.value;
       });;
    }

    
    

  }



  // createWindow():void {
  //   document.getElementById("addInput")?.setAttribute("disabled", "true");
  //   document.getElementById("panesInput")?.removeAttribute("disabled");
  // }

  // getWindowPanes():void {
  //   let currentPanel:SVGTemplate;
  //   for(let i:number = 0; i < this.sharedDataService.window.length; ++i) {
  //     currentPanel = new SVGTemplate(this.sharedDataService.window[i].d);
  //     alert("d attribute for panel " + String(i) + "'s panes:\n\n" + currentPanel.getLaserCutPanes()[0]);
  //   }
  // }

  // resetWindow():void {
  //   this.sharedDataService.window = [];
  //   this.clearOldPanes();
  //   this.clearWindowPreview();
  //   document.getElementById("svgTemplate")?.setAttribute("d", "");
  //   document.getElementById("addInput")?.removeAttribute("disabled");
  //   document.getElementById("panesInput")?.setAttribute("disabled", "true");
  // }

  ngOnInit(): void {
  }

}
