import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-stage4',
  templateUrl: './stage4.component.html',
  styleUrls: ['./stage4.component.css']
})
export class Stage4Component implements OnInit {

  currentChosenColorID:number = 0;
  colorChoices:{id:number, name:string, hex:string, paneColor:boolean, isAvailable:boolean, placementID:number, opacity:number}[] = [];
  colorIDs:number[] = [];
  numberPossibleColors:number = 0;
  selectedPalleteID:number = -1;

  constructor(public sharedDataService:SharedDataService) { }

  ngOnInit(): void {
  }

  previousStage() {
    document.getElementById("stage3")?.scrollIntoView({behavior: 'smooth'});
  }

  nextstage5() {
    document.getElementById("stage5")?.setAttribute("style", "visibility:visible;")
    document.getElementById("stage5")?.scrollIntoView({behavior: 'smooth'});
  }

  updateSelectedPalleteCategory(palleteCategory:string):void {this.sharedDataService.selectedPalleteCategory = palleteCategory;}
  updateSelectedPallete(palleteID:number):void {this.selectedPalleteID = palleteID;}

  updateColorMode(mode:string = ''):void {
    this.sharedDataService.colorModeSelected = mode;
  }

  getPalleteColorD(colors:string, colorIndex:number):string {
    let separatedColors:string[] = colors.split(",");
    let splitNumber:number = 300 / separatedColors.length;
    let paneString:string = "M " + colorIndex*splitNumber + ", 0 V 300 H " + (colorIndex+1)*splitNumber + "V 0 Z";
    return paneString;
  }

  getPossibleColors():number {
    if(this.sharedDataService.currentStepID < 5) {return 0;}
    let possibleColors:{id:number, name:string, hex:string, paneColor:boolean, isAvailable:boolean, placementID:number, opacity:number}[] = [];
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


    if(this.colorIDs.length == 0) {this.colorIDs = colorIds.sort();}
    if(this.colorChoices.length == 0) {
      for(let i:number = 0; i < this.colorIDs.length; ++i) {
        let defaultColors:{id:number, name:string, hex:string, paneColor:boolean, isAvailable:boolean, placementID:number, opacity:number}[] = this.sharedDataService.colorsData.filter(function(item) { return item.hex == 'FFFFFF'; });
        let defaultColor:{id:number, name:string, hex:string, paneColor:boolean, isAvailable:boolean, placementID:number, opacity:number} = defaultColors[0]; 
        this.colorChoices.push(defaultColor);
      }
    }
    // alert(colorIds.length);
    this.numberPossibleColors = colorIds.length;
    this.colorIDs = colorIds;
    return colorIds.length;
  }

  // Fills selected panel for a pane if autofill string exists
  autofillPanel(palleteColors:string):void {
    let separatedColors:string[] = palleteColors.split(",");
    
    for(let colorIndex:number = 0; colorIndex < separatedColors.length; ++colorIndex) {
      let panelNumber:number = 0;
      for(let row of this.sharedDataService.panelLayout) {
        for(let svgTemplate of row) {
          let splitAutofillString:string[] = svgTemplate.autofillString.split(",");
          // alert(splitAutofillString);
          for(let i:number = 0; i < splitAutofillString.length; ++i) {
            if(Number(splitAutofillString[i]) == this.colorIDs[colorIndex]) {
              document.getElementById("windowPane"+panelNumber+"_"+i)?.setAttribute("style", "fill:#"+separatedColors[colorIndex]);
              document.getElementById("windowPaneFinished"+panelNumber+"_"+i)?.setAttribute("style", "fill:#"+separatedColors[colorIndex]);
              this.sharedDataService.panelColoringArray[panelNumber][i] = separatedColors[colorIndex];
            } 
          }
          ++panelNumber;
        }
      }
    }
    
  }
}
