import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { HttpClient } from '@angular/common/http';
import { SVGTemplate } from '../svgScaler';
import { DividerWindow } from '../svgScaler';


@Component({
  selector: 'app-user-directory',
  templateUrl: './user-directory.component.html',
  styleUrls: ['./user-directory.component.css']
})
export class UserDirectoryComponent implements OnInit {
    userData:any;
    user:any;
    data:any;
    userOrder:any;
    order:any;
    filterStatus:string = "all";

    constructor(public sharedDataService:SharedDataService, private http:HttpClient) { }

    ngOnInit(): void {
      this.refreshUsers();
      this.refreshOrders();
    }

    convertNumber(num:number, unit:string):number {
      if(unit == "mm") {return num;}
      else if(unit == "inches") {return num*25.4;}
      else {return num*10;};
    }

    refreshUsers():void {
      this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/users").subscribe(result => {
        this.userData = JSON.parse(JSON.stringify(result));
      });
    }

    refreshOrders():void {
      this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/orders").subscribe(result => {
        this.userOrder = JSON.parse(JSON.stringify(result));
      });
    }
    
    selectUser(user:any):void {
      this.refreshOrders();
      this.order = this.userOrder;
      this.user = user;
      let counter:number = 0;
      let saveCounter:number = 0;
      let sign:string = user[5].split(" ");
      for(let ord of this.userOrder)
      {
        if(ord[1] == this.user[3])
        {
          counter++;
          if(ord[18] == 'Saved')
          {
            saveCounter++;
          }
        }
      }
      (<HTMLInputElement>document.getElementById("orderInput"))!.value = String(counter);
      (<HTMLInputElement>document.getElementById("savedInput"))!.value = String(saveCounter);
    }

    selectOrder(order:any):void {
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
      this.sharedDataService.currentFilamentColor = order[22];
  
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
        if(window.innerWidth < 576) {document.getElementById("orderPreview")?.scrollIntoView({behavior: 'smooth'});}
        
      }
      catch {
        alert("Something went wrong while creating your order's preview.");
      }
    }

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

    filterUsers():void {
      let data:any;
      this.order = this.userOrder;
      let counter:number = 0;
      let saveCounter:number = 0;
      let orderInput = Number((<HTMLInputElement>document.getElementById("orderInput"))?.value);
      let savedInput = Number((<HTMLInputElement>document.getElementById("savedInput"))?.value);
      for(let user of this.userData)
      {
        let sign:string = user[5].split(" ");
        // If input == month day year, month year, month day, year, or month
        if(sign[2] == "May")
        {
          data += user;
        }
      }
      for(let ord of this.userOrder)
      {
        if(ord[1] == this.user[3])
        {
          counter++;
          if(ord[18] == 'Saved')
          {
            saveCounter++;
          }
        }
      }
      if(counter == orderInput)
      {

      }
      if(saveCounter == savedInput)
      {
        
      }
      let selectedUserData:string = "";
      let statusesSelected:number = 0;
      for(const orderStatus of ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']) {
        if((<HTMLInputElement>document.getElementById("customSwitch_"+orderStatus))?.checked) {
          selectedUserData += orderStatus + ";";
          ++statusesSelected;
        }
      }
      if(statusesSelected == 0) {this.filterStatus = "all";}
      else {this.filterStatus = selectedUserData;}
    }

    displayUserData():void {
      let data:any = this.userData;
      let orderInfo:any = this.userOrder;
      let totalnum:number = this.userData.length;
      let order:number = Number((<HTMLInputElement>document.getElementById("orderInput"))?.value);
      let save:number = Number((<HTMLInputElement>document.getElementById("savedInput"))?.value);
    }

    isAdmin(): boolean {
      if(this.sharedDataService.userInfo[5] == "admin") {return true;}
      else {return false;}
    }
}
