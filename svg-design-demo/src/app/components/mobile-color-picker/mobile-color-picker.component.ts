import { Component } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-mobile-color-picker',
  templateUrl: './mobile-color-picker.component.html',
  styleUrls: ['./mobile-color-picker.component.css']
})
export class MobileColorPickerComponent {

  currentChosenColorID:number = 0;
  colorChoices:{id:number, name:string, hex:string, paneColor:boolean, isAvailable:boolean, placementID:number, opacity:number}[] = [];
  colorIDs:number[] = [];

  constructor(public sharedDataService:SharedDataService) {
    // this.apiService.readUsers().subscribe((users: User[])=>{
    //   this.users = users;
    // }) 
  }

  changeColor(colorID:number) {
    // Autofill is on
    if((<HTMLInputElement>document.getElementById("customSwitch_autofill"))?.checked) {
      let panelNum:number = 0;
      let baseAutofillString = this.sharedDataService.panelLayout[Math.floor(this.sharedDataService.currentTemplateNumber/this.sharedDataService.panelLayoutDims[0])][this.sharedDataService.currentTemplateNumber%this.sharedDataService.panelLayoutDims[0]].autofillString;
      
      for(let row of this.sharedDataService.panelLayout) {
        for(let svgTemplate of row) {
          // if(panelNum == 0) {baseAutofillString = svgTemplate.autofillString;}
          // this.autofillPanel(svgTemplate.autofillString, baseAutofillString, panelNum, paneID);
          ++panelNum;
        }
      }
    }
  }

  test():void {
    for(let row of this.sharedDataService.panelLayout) {
      for(let svgTemplate of row) {
        // if(panelNum == 0) {baseAutofillString = svgTemplate.autofillString;}
        alert(svgTemplate.autofillString);
      }
    }
  }

  changeCurrentColorID(id:number):void {
    this.currentChosenColorID = id;
  }

  chooseColor(color:{id:number, name:string, hex:string, paneColor:boolean, isAvailable:boolean, placementID:number, opacity:number}):void {
    this.colorChoices[this.currentChosenColorID] = color;
    this.autofillPanel(this.colorIDs[this.currentChosenColorID], color);
  }

  getColorLabel(id:number):string {
    let final:string = "";
    if(id == 0) {final = "Primary";}
    else if(id == 1) {final = "Secondary";}
    else {final = "Accent " + (id-1);}
    return final;
  }

  getPossibleColors():{id:number, name:string, hex:string, paneColor:boolean, isAvailable:boolean, placementID:number, opacity:number}[] {
    if(this.sharedDataService.currentStepID < 6) {return [];}
    let possibleColors:{id:number, name:string, hex:string, paneColor:boolean, isAvailable:boolean, placementID:number, opacity:number}[] = [];
    let colorIds:number[] = [];

    for(let row of this.sharedDataService.panelLayout) {
      for(let svgTemplate of row) {
        let currentAutofillString:string[] = svgTemplate.autofillString.split(",");
        for(let i:number = 0; i < currentAutofillString.length; ++i) {
          if(!colorIds.includes(Number(currentAutofillString[i]))) {colorIds.push(Number(currentAutofillString[i]));}
        }
        console.log(currentAutofillString);
      }
    }

    if(this.colorIDs.length == 0) {this.colorIDs = colorIds.sort();}
    if(this.colorChoices.length == 0) {
      for(let i:number = 0; i < this.colorIDs.length; ++i) {
        let defaultColors:{id:number, name:string, hex:string, paneColor:boolean, isAvailable:boolean, placementID:number, opacity:number}[] = this.sharedDataService.colorsData.filter(function(item) { return item.hex == 'FFFFFF'; });
        let defaultColor:{id:number, name:string, hex:string, paneColor:boolean, isAvailable:boolean, placementID:number, opacity:number} = defaultColors[0]; 
        this.colorChoices.push(defaultColor);
      }
    }
    return this.colorChoices;
  }

  // Fills selected panel for a pane if autofill string exists
  autofillPanel(colorID:number, color:{id:number, name:string, hex:string, paneColor:boolean, isAvailable:boolean, placementID:number, opacity:number}):void {
    let panelNumber:number = 0;
    for(let row of this.sharedDataService.panelLayout) {
      for(let svgTemplate of row) {
        let splitAutofillString:string[] = svgTemplate.autofillString.split(",");
        for(let i:number = 0; i < splitAutofillString.length; ++i) {
          if(Number(splitAutofillString[i]) == colorID) {
            document.getElementById("windowPane"+panelNumber+"_"+i)?.setAttribute("style", "fill:#"+color.hex);
            document.getElementById("windowPaneFinished"+panelNumber+"_"+i)?.setAttribute("style", "fill:#"+color.hex);
            this.sharedDataService.panelColoringArray[panelNumber][i] = color.hex;
          } 
        }
        ++panelNumber;
      }
    }
  }
}
