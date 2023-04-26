import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { HttpClient } from '@angular/common/http';
import { SVGTemplate } from '../svgScaler';
import { DividerWindow } from '../svgScaler';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-page',
  templateUrl: './order-page.component.html',
  styleUrls: ['./order-page.component.css']
})
export class OrderPageComponent implements OnInit {
  userOrders:any;
  adminFilter:boolean = false;
  order:any;

  constructor(public sharedDataService:SharedDataService, private http:HttpClient, private router:Router) { }

  ngOnInit(): void {
    this.refreshOrders();
  }

  convertNumber(num:number, unit:string):number {
    if(unit == "mm") {return num;}
    else if(unit == "inches") {return num*25.4;}
    else {return num*10;};
  }

  // Method to check whether selected window shape is a 2xHung
  isDoubleHung():boolean {
    if(this.sharedDataService.selectedWindowShape.substring(0, 2) == "2x") {return true;}
    return false;
  }

  // Selects a previous order and fills in all the given information
  selectOrder(order:any) {
    // Order --> [id, email, dividerType, selectedUnits, windowWidth, windowHeight, horzDividers, 
    // vertDividers, dividerWidth, templateID, colorString, street, city, state, zip, country, 
    // bottomSashWidth, bottomSashHeight, status]
    this.order = order;
    this.sharedDataService.selectedDividerType = order[2]; 
    this.sharedDataService.unitChoice = order[3];
    this.sharedDataService.windowWidth = this.convertNumber(Number(order[4]), this.sharedDataService.unitChoice);
    this.sharedDataService.windowHeight = this.convertNumber(Number(order[5]), this.sharedDataService.unitChoice);
    this.sharedDataService.dividerNumbers = [Number(order[6]), Number(order[7])];
    this.sharedDataService.dividerWidth = this.convertNumber(Number(order[8]), this.sharedDataService.unitChoice);
    this.sharedDataService.selectedTemplateID = Number(Number(order[9]));
    this.sharedDataService.bottomSashWidth = this.convertNumber(Number(order[16]), this.sharedDataService.unitChoice);
    this.sharedDataService.bottomSashHeight = this.convertNumber(Number(order[17]), this.sharedDataService.unitChoice);
    if(this.sharedDataService.bottomSashWidth > 0 && this.sharedDataService.bottomSashHeight > 0) {this.sharedDataService.selectedWindowShape = "2xhung2to4";}
    else {this.sharedDataService.selectedWindowShape = "vertical2to4";}
    this.sharedDataService.continueSavedOrder = true;

    // Setting up divider window with this info
    let newDividerWindow:DividerWindow;
    newDividerWindow = new DividerWindow(this.sharedDataService.windowWidth >= 100 ? this.sharedDataService.windowWidth : undefined, this.sharedDataService.windowHeight >= 100 ? this.sharedDataService.windowHeight : undefined, this.sharedDataService.dividerNumbers[0], this.sharedDataService.dividerNumbers[1], this.sharedDataService.dividerWidth, 
    this.sharedDataService.selectedDividerType, 
    this.sharedDataService.selectedWindowShape.substring(0, 2) == "2x" ? true : false, 
    this.sharedDataService.bottomSashWidth, this.sharedDataService.bottomSashHeight);
    this.sharedDataService.dividerWindow = newDividerWindow;

    
    let templateIndex:number = this.sharedDataService.templateData.findIndex(function(item, i){
      return Number(item.id) == Number(order[9])
    });

    
    try {
      this.createPreview(this.sharedDataService.templateData[templateIndex]);

      let panelColorStrings:string[] = order[10].split(";");
      for(let i:number = 0; i < panelColorStrings.length; ++i) {
        let tmp:string[] = panelColorStrings[i].split(",");
        for(let j:number = 0; j < tmp.length; ++j) {
          this.sharedDataService.currentPaneColor = tmp[j];
          document.getElementById("windowPane"+i+"_"+j)?.setAttribute("style", "fill:#"+this.sharedDataService.currentPaneColor);
          document.getElementById("windowPaneFinished"+i+"_"+j)?.setAttribute("style", "fill:#"+this.sharedDataService.currentPaneColor);
          this.sharedDataService.panelColoringArray[i][j] = this.sharedDataService.currentPaneColor;
        }
      }
      if(window.innerWidth < 576) {document.getElementById("pastOrderPreview")?.scrollIntoView({behavior: 'smooth'});}
      
    }
    catch {
      alert("Something went wrong while creating your order's preview.");
    }
    
    
  }

  // Continue saved design
  continueSavedDesign():void {
    this.router.navigate(['/'])
    // Updating template dimensions
    document.getElementById("windowPerimeter")?.setAttribute("d", this.sharedDataService.dividerWindow.dString);
    document.getElementById("windowPerimeter")?.setAttribute("style", "fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:.2;");
    let viewboxValue:string = this.sharedDataService.dividerWindow.getViewbox();
    document.getElementById("dividerTemplate")?.setAttribute("viewBox", viewboxValue);

    let paneNum:number = 0;
    for(let row:number = 0; row < this.sharedDataService.dividerWindow.windowPanes.length; ++row) {
      for(let col:number = 0; col < this.sharedDataService.dividerWindow.windowPanes[row].length; ++col) {
        // Updating each individual pane
        document.getElementById("dividerPane"+paneNum)?.setAttribute("d", this.sharedDataService.dividerWindow.windowPanes[row][col].dString);
        document.getElementById("dividerPane"+paneNum)?.setAttribute("style", "fill-rule:evenodd;stroke:#000000;stroke-width:.2;");
        ++paneNum;
      }
    }
    this.nextstage5();
  }

  // Creates the window previews
  createPreview(temp:{id:number, numPanels:number, panelDims:number[], tempString:string, category:string}):void {
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
    // if(this.isColorPage()) {
    //   for(const tempCategory of ["Artist Inspired", "Interests", "Garden", "Classics"]) {
    //     if(temp.category != undefined && temp.category.includes(tempCategory)) {(<HTMLInputElement>document.getElementById("customSwitch_"+tempCategory))!.checked = true;}
    //     else {(<HTMLInputElement>document.getElementById("customSwitch_"+tempCategory))!.checked = false;}
    //   }
    // }
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
    this.sharedDataService.panelLayout = [];
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

  adminFilterToggle():void {
    this.adminFilter = !this.adminFilter;
  }

  getOrderFieldHeading(index:number):string {
    let final:string = "";
    switch(index) {
      case 0:
        final = "ID: ";
        break;
      case 1:
        final = "Email: ";
        break;
      case 2:
        final = "Divider Type: ";
        break;
      case 3:
        final = "Units: ";
        break;
      case 4:
        final = "Window Width: ";
        break;
      case 5:
        final = "Window Height: ";
        break;
      case 6:
        final = "Horizontal Dividers: ";
        break;
      case 7:
        final = "Vertical Dividers: ";
        break;
      case 8:
        final = "Divider Width: ";
        break;
      case 9:
        final = "Template ID: ";
        break;
      case 10:
        final = "Pane Coloring String: ";
        break;
      case 11:
        final = "Street: ";
        break;
      case 12:
        final = "City: ";
        break;
      case 13:
        final = "State: ";
        break;
      case 14:
        final = "Zip Code: ";
        break;
      case 15:
        final = "Country: ";
        break;
      case 16:
        final = "Bottom Sash Width: ";
        break;
      case 17:
        final = "Bottom Sash Height: ";
        break;
      case 18:
        final = "Status: ";
        break;
      case 19:
        final = "Country: ";
        break;
      default:
        final = "";
        break;
    }
    return final;
  }

  printAlertString(s:string) {
    if(s.length >= 1000) {
      let subFinalNums:number = Math.floor(s.length / 1000);
      for(let i:number = 0; i < subFinalNums; ++i) {
        alert(s.substring(i*1000, (i+1)*1000));
      }
    }
    else {alert(s);}
  }

  getOrderInfo():void {
    let final:string = "";
    for(let i:number = 0; i < this.order.length-2; ++i) {
      if(i == 10) {continue;}
      final += this.getOrderFieldHeading(i) + this.order[i] + "\n";
    }
    this.printAlertString(final);
    final = this.getOrderFieldHeading(10) + this.order[10] + "\n";
    this.printAlertString(final);
  }

  // Refreshes list of orders
  refreshOrders():void {
    const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : "";
    const password:string = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[4] : "";
    this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/userorders?email='"+email+"'&password='"+password+ "'").subscribe(result => {
      this.userOrders = JSON.parse(JSON.stringify(result));
    });
  }
  
  // Deletes order from database
  deleteOrder():void {
    const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : "";
    const password:string = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[4] : "";
    const orderId:number = this.order[0];

    if (orderId != undefined && orderId != -1 && confirm('Are you sure you want to delete order ' + orderId + '?')) {
      this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/deleteorder?email='"+email+"'&password='"+password+ "'&orderId=" + orderId).subscribe(result => {
        let test = JSON.stringify(result).split('[').join("").split(']').join("").split('"').join("").split(",");
        alert(test);
        this.refreshOrders();
       });
    }
  }

  nextstage5() {
    document.getElementById("stage5")?.setAttribute("style", "visibility:visible;")
    document.getElementById("stage5")?.scrollIntoView({behavior: 'smooth'});
    if(this.sharedDataService.signedIn) {this.sharedDataService.currentStepID = 5;}
  }

}
