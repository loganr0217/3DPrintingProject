import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-stage2',
  templateUrl: './stage2.component.html',
  styleUrls: ['./stage2.component.css']
})
export class Stage2Component implements OnInit {

  constructor(private sharedDataService:SharedDataService, private location: Location) { }
  
  // Stage 2 attributes
  dividerType:string;
  windowShape:string;
  windowShapes:string[];

  ngOnInit(): void {
    this.dividerType = this.sharedDataService.selectedDividerType;
    this.windowShape = this.sharedDataService.selectedWindowShape;
    this.windowShapes = this.sharedDataService.windowShapes;
  }

  displayWindowShapes(dividerType:string) {
    // Adding new window shapes
    for(let i = 0; i < this.windowShapes.length; ++i) {
      document.getElementById("windowShapeImage_"+this.windowShapes[i])?.setAttribute("src", "assets/img/windowButtons/"+this.windowShapes[i]+this.dividerType+".svg");
    }
  }

  // Method to change the currently selected divider
  chooseDivider(dividerType:string) {
    // Unhighlighting old selection if possible and highlighting new one
    if(this.dividerType != null) {document.getElementById("dividerTypeImage_"+this.dividerType)?.setAttribute("style", "");}
    document.getElementById("dividerTypeImage_"+dividerType)?.setAttribute("style", "filter: invert(8%) sepia(100%) saturate(7101%) hue-rotate(248deg) brightness(104%) contrast(144%);");
    if(dividerType == "plain") {
      document.getElementById("dividerDetailsText")!.innerHTML = "Enter the dimensions of your window below.";
      document.getElementById("horizontalDividersInput")?.setAttribute("disabled", "true");
      document.getElementById("verticalDividersInput")?.setAttribute("disabled", "true");
    }
    else {
      document.getElementById("dividerDetailsText")!.innerHTML = "Enter the dimensions of your window below. Then, let us know how many horizontal and vertical dividers you have.";
      document.getElementById("horizontalDividersInput")?.removeAttribute("disabled");
      document.getElementById("verticalDividersInput")?.removeAttribute("disabled");
    }
    
    // Updating values for dividerType
    this.sharedDataService.selectedDividerType = dividerType;
    this.dividerType = dividerType;

    // Updating the dividerWindow if it exists already
    if(this.sharedDataService.dividerWindow != null) {
      this.sharedDataService.dividerWindow.updateDividerType(dividerType);
      document.getElementById("windowPerimeter")?.setAttribute("d", this.sharedDataService.dividerWindow.dString);
    }
    
    this.displayWindowShapes(dividerType);
  }

  // Method to change the currently selected window shape
  chooseWindowShape(windowShape:string) {
    // Unhighlighting old selection if possible and highlighting new one
    if(this.windowShape != null) {document.getElementById("windowShapeImage_"+this.windowShape)?.setAttribute("style", "");}
    document.getElementById("windowShapeImage_"+windowShape)?.setAttribute("style", "filter: invert(58%) sepia(100%) saturate(7101%) hue-rotate(200deg) brightness(104%) contrast(144%);");

    // Updating values for windowShape
    this.sharedDataService.selectedWindowShape = windowShape;
    this.windowShape = windowShape;
  }

  nextstage2BCon() {
    document.getElementById("stage2BCon")?.scrollIntoView({behavior: 'smooth'});
  }

  preStage1Con() {
    document.getElementById("stage1Con")?.scrollIntoView({behavior: 'smooth'});
  }

  prestage2ACon() {
    document.getElementById("stage2ACon")?.scrollIntoView({behavior: 'smooth'});
  }

  nextstage3() {
    document.getElementById("stage3")?.scrollIntoView({behavior: 'smooth'});
  }
}
