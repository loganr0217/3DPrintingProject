import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { SVGTemplate } from '../svgScaler';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent implements OnInit {
  userOrders:any;

  constructor(public sharedDataService:SharedDataService, private http:HttpClient) { }

  ngOnInit(): void {
    const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : "";
    const password:string = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[4] : "";
    this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/userorders?email='"+email+"'&password='"+password+ "'").subscribe(result => {
      this.userOrders = JSON.parse(JSON.stringify(result));
    });

  }

  convertNumber(num:number, unit:string):number {
    if(unit == "mm") {return num;}
    else if(unit == "inches") {return num*25.4;}
    else {return num*10;};
  }

  // Selects a previous order and fills in all the given information
  selectOrder(order:any) {
    // Order --> [id, email, dividerType, selectedUnits, windowWidth, windowHeight, horzDividers, 
    // vertDividers, dividerWidth, templateID, colorString, street, city, state, zip, country, 
    // bottomSashWidth, bottomSashHeight, status]
    this.sharedDataService.selectedDividerType = order[2]; 
    this.sharedDataService.unitChoice = order[3];
    this.sharedDataService.windowWidth = this.convertNumber(order[4], this.sharedDataService.unitChoice);
    this.sharedDataService.windowHeight = this.convertNumber(order[5], this.sharedDataService.unitChoice);
    this.sharedDataService.dividerNumbers = [order[6], order[7]];
    this.sharedDataService.dividerWidth = this.convertNumber(order[8], this.sharedDataService.unitChoice);
    this.sharedDataService.selectedTemplateID = order[9];
    this.sharedDataService.bottomSashWidth = this.convertNumber(order[16], this.sharedDataService.unitChoice);
    this.sharedDataService.bottomSashHeight = this.convertNumber(order[17], this.sharedDataService.unitChoice);
    
    let templateIndex:number = this.sharedDataService.templateData.findIndex(function(item, i){
      return Number(item.id) == Number(order[9])
    });
    
    this.createPreview(this.sharedDataService.templateData[templateIndex]);

    //console.log(this.sharedDataService.panelColoringArray);
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
    
  }

  // Creates the window previews
  createPreview(temp:{id:number, numPanels:number, panelDims:number[], tempString:string, category:string}):void {
    this.sharedDataService.panelLayout = this.getPanelLayout(temp);
    //console.log(this.sharedDataService.panelLayout);
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
    
    //console.log(temp.panelDims);
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
      this.sharedDataService.topPanelWidth;
      if(panelID < this.sharedDataService.numberTopPanels) {
        myTemplate.scaleTemplate(this.sharedDataService.topPanelWidth/300, this.sharedDataService.topPanelHeight/300);
      } 
      else {
        myTemplate.scaleTemplate(this.sharedDataService.bottomPanelWidth/300, this.sharedDataService.bottomPanelHeight/300);
      }
      //console.log(panelLayout[Math.floor(panelID/temp.panelDims[0])]);
      panelLayout[Math.floor(panelID/temp.panelDims[0])].push(myTemplate);
    }
    //console.log(panelLayout);
    return panelLayout;
  }

}
