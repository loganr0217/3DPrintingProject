import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { User } from 'src/app/models/user';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { DividerWindow } from '../svgScaler';
import { HttpClient } from '@angular/common/http';

declare var $:any;
@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {
  //users:User[];
  constructor(public sharedDataService:SharedDataService, private http:HttpClient) {
    // this.apiService.readUsers().subscribe((users: User[])=>{
    //   this.users = users;
    // }) 
  }

  getStageVisibility(stage:string) {
    let finalResult:string = "";
    switch(stage) {
      case("landingPage"): {
        if(this.sharedDataService.continueSavedOrder) {finalResult = "visibility: hidden; display: none;";}
        break;
      }
      case("stage4"): {
        if(this.sharedDataService.selectedTemplateID == -1 || (this.sharedDataService.currentStepID < 5 && !this.sharedDataService.continueSavedOrder)) {finalResult = "visibility: hidden; display: none;";}
        break;
      }
      case("stage5"): {
        if(this.sharedDataService.selectedTemplateID == -1 || (this.sharedDataService.currentStepID < 6 && window.innerWidth <= 576)) {finalResult = "visibility: hidden; display: none;";}
        break;
      }
      case("checkout"): {
        if(this.sharedDataService.selectedTemplateID == -1 || (this.sharedDataService.currentStepID < 7 && window.innerWidth <= 576)) {finalResult = "visibility: hidden; display: none;";}
        break;
      }

      // case("stage2"):
      // case("stage3"): {
      //   if(this.sharedDataService.selectedWindowShape == "unselected" || this.sharedDataService.continueSavedOrder) {finalResult = "visibility: hidden; display: none;";}
      //   break;
      // }
      // case("templateCategory"): {
      //   if(this.sharedDataService.continueSavedOrder) {finalResult = "visibility: hidden; display: none;";}
      //   break;
      // }
      
    }
    return finalResult;
  }

  isCustomProgressBarHidden() {
    if(this.sharedDataService.currentStepID >= 1 || (this.sharedDataService.currentStepID == 0 && !this.sharedDataService.signedIn)) {return false;}
    return true;
  }

  ngOnInit(): void {
  }

  isAvailableTemplate():boolean {
    let availableTemplate:boolean = false;
    if(this.sharedDataService.templateData == undefined) {return false;}
    for(let i:number = 0; i < this.sharedDataService.templateData.length; ++i) {
      if(this.sharedDataService.panelLayoutDims[0] == this.sharedDataService.templateData[i].panelDims[0]
        && this.sharedDataService.panelLayoutDims[1] == this.sharedDataService.templateData[i].panelDims[1] 
        && this.sharedDataService.templateData[i].category != undefined) {
          availableTemplate = true;
          break;
      }
    }
    return availableTemplate;
  }

  // Focus email signup
  focusEmailRegister():void {
    if(this.sharedDataService.signedIn) {
      this.sharedDataService.currentStepID = 1;
      this.stageSwitch();
    }
    else {
      document.getElementById("requiredEmailFieldStep0")?.focus();
      document.getElementById("requiredEmailFieldStep0")?.blur();
      document.getElementById("requiredEmailFieldStep0")?.focus();
    }
    
  }


  stageSwitch():void {
    switch(this.sharedDataService.currentStepID) {
      case(-1): {
        document.getElementById("entirePage")?.scrollIntoView({behavior: 'smooth'});
        break;
      }
      case(0): {
        document.getElementById("stage2")?.setAttribute("style", "visibility:visible;");
        document.getElementById("stage2")?.scrollIntoView({behavior: 'smooth'});
        break;
      }
      case(1): {
        document.getElementById("stage2ACon")?.setAttribute("style", "visibility:visible;");
        document.getElementById("stage2ACon")?.scrollIntoView({behavior: 'smooth'});
        break;
      }
      case(2): {
        document.getElementById("section2")?.setAttribute("style", "visibility:visible;");
        document.getElementById("section2")?.scrollIntoView({behavior: 'smooth'});
        break;
      }
      case(3): {
        document.getElementById("stage3")?.setAttribute("style", "visibility:visible;");
        document.getElementById("stage3")?.scrollIntoView({behavior: 'smooth'});
        break;
      }
      case(4): {
        document.getElementById("templateCategoryStage")?.setAttribute("style", "visibility:visible;");
        document.getElementById("templateCategoryStage")?.scrollIntoView({behavior: 'smooth'});
        break;
      }
      case(5): {
        document.getElementById("stage4")?.setAttribute("style", "visibility:visible;");
        document.getElementById("stage4")?.scrollIntoView({behavior: 'smooth'});
        break;
      }
      case(6): {
        document.getElementById("stage5")?.setAttribute("style", "visibility:visible;");
        document.getElementById("stage5")?.scrollIntoView({behavior: 'smooth'});
        break;
      }
      case(7): {
        document.getElementById("checkoutStage")?.setAttribute("style", "visibility:visible;");
        document.getElementById("checkoutStage")?.scrollIntoView({behavior: 'smooth'});
        break;
      }
      // case(8): {
      //   document.getElementById("checkoutStage")?.setAttribute("style", "visibility:visible;");
      //   document.getElementById("checkoutStage")?.scrollIntoView({behavior: 'smooth'});
      //   break;
      // }
    }
  }

  previousStage():void {
    if(this.sharedDataService.continueSavedOrder && this.sharedDataService.currentStepID == 5) {return;}
    if(this.sharedDataService.currentStepID == 1 && this.sharedDataService.signedIn) {this.sharedDataService.currentStepID = -1;} 
    else {--this.sharedDataService.currentStepID;}
    if(this.sharedDataService.currentStepID == 3 && this.sharedDataService.sampleOrder != '') {--this.sharedDataService.currentStepID;}
    this.stageSwitch();
  }

  updateSession():void {
    const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : 'undefined';
    this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/updatesession?sessionID="+this.sharedDataService.sessionID+"&lastStepID="+this.sharedDataService.currentStepID+"&startingURL='"+this.sharedDataService.sessionStartingUrl+"'&userEmail='"+email+"'").subscribe(result => { 
      });
  }

  nextStage():void {
    if(this.sharedDataService.currentStepID == 3) {
      this.updateDimensionsButton();
      this.updatePanelLayout();
      if(!this.isAvailableTemplate() || this.isDoubleHung()) {$('#dimensionsFormModal').modal('show');}
      else {
        ++this.sharedDataService.currentStepID;
        this.stageSwitch();
        this.updateSession();
        
      }
      
    }
    else if(this.sharedDataService.currentStepID < 7) {
      if(this.sharedDataService.currentStepID == 2) {
        if(this.sharedDataService.selectedWindowShape != 'unselected') {
          ++this.sharedDataService.currentStepID;
          if(this.sharedDataService.sampleOrder != '') {++this.sharedDataService.currentStepID;}
          this.stageSwitch();
          this.updateSession();
        }
      }
      else if(this.sharedDataService.currentStepID == 4) {
        if(this.sharedDataService.selectedTemplateCategory != undefined) {
          ++this.sharedDataService.currentStepID;
          this.stageSwitch();
          this.updateSession();
        }
      }
      else if(this.sharedDataService.currentStepID == 0) {
        this.focusEmailRegister();
      } 
      else {
        ++this.sharedDataService.currentStepID;
        this.stageSwitch();
        this.updateSession();
      }
    }
  }



  /******* Code for window detail step ********/
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
  // Method to clear old panes
  clearOldDividerPanes():void {
    let numPanes:number = this.sharedDataService.dividerWindow.windowPanes.length * this.sharedDataService.dividerWindow.windowPanes[0].length; 
    for(let i = 0; i < numPanes; ++i) {
      document.getElementById("dividerPane"+i)?.setAttribute("d", "");
      document.getElementById("dividerPane"+i)?.setAttribute("style", "")
      document.getElementById("dividerPane"+i)?.setAttribute("transform", "");
    }
  }
  updateDimensionsButton():void {
    let newWidth:number = this.convertNumber(Math.floor(Number((<HTMLInputElement>document.getElementById("widthInput")).value)) + (this.sharedDataService.topSash ? this.sharedDataService.windowWidthFractionNum/16 : this.sharedDataService.bottomSashWidthFractionNum/16), this.sharedDataService.unitChoice);
    let newHeight:number = this.convertNumber(Math.floor(Number((<HTMLInputElement>document.getElementById("heightInput")).value)) + (this.sharedDataService.topSash ? this.sharedDataService.windowHeightFractionNum/16 : this.sharedDataService.bottomSashHeightFractionNum/16), this.sharedDataService.unitChoice);
    let newBottomWidth:number = 0, newBottomHeight:number = 0;
    if(window.innerWidth <= 576 && this.isDoubleHung()) {
      newBottomWidth = this.convertNumber(Math.floor(Number((<HTMLInputElement>document.getElementById("bottomWidthInput")).value)) + (this.sharedDataService.topSash ? this.sharedDataService.windowWidthFractionNum/16 : this.sharedDataService.bottomSashWidthFractionNum/16), this.sharedDataService.unitChoice);
      newBottomHeight = this.convertNumber(Math.floor(Number((<HTMLInputElement>document.getElementById("bottomHeightInput")).value)) + (this.sharedDataService.topSash ? this.sharedDataService.windowHeightFractionNum/16 : this.sharedDataService.bottomSashHeightFractionNum/16), this.sharedDataService.unitChoice);
    }
    this.updateDimensions(newWidth, newHeight, newBottomWidth, newBottomHeight);
  }
  // Method to update dimensions
  updateDimensions(newWidth:number, newHeight:number, newBottomWidth:number=0, newBottomHeight:number=0):void {
    this.clearOldDividerPanes();
    
    // Getting the user's desired width and height and divider info
    // let newWidth:number = Number((<HTMLInputElement>document.getElementById("widthInput")).value);
    // let newHeight:number = Number((<HTMLInputElement>document.getElementById("heightInput")).value);
    let horzDividers:number;
    let vertDividers:number;
    let dividerWidth:number;
    
    if(this.sharedDataService.selectedDividerType == "nodiv") {
      horzDividers = 0;
      vertDividers = 0;
      dividerWidth = 0;
    }
    else {
      if(!this.sharedDataService.topSash) {
        horzDividers = this.sharedDataService.dividerNumbers[0];
        vertDividers = this.sharedDataService.dividerNumbers[1];
        dividerWidth = this.sharedDataService.dividerWidth;
      }
      else {
        horzDividers = Number((<HTMLInputElement>document.getElementById("horizontalDividersInput")).value) >= 0 ? Number((<HTMLInputElement>document.getElementById("horizontalDividersInput")).value) : 0;
        vertDividers = Number((<HTMLInputElement>document.getElementById("verticalDividersInput")).value) >= 0 ? Number((<HTMLInputElement>document.getElementById("verticalDividersInput")).value) : 0;
        dividerWidth = this.convertNumber(Math.floor(Number((<HTMLInputElement>document.getElementById("dividerWidthInput")).value)) + (this.sharedDataService.dividerWidthFractionNum/16), this.sharedDataService.unitChoice); 
      }
      
    }
    if(dividerWidth == 0) {dividerWidth = 25.4;}
    // dividerWidth = this.convertNumber(dividerWidth, this.sharedDataService.unitChoice);
    let newDividerWindow:DividerWindow;

    // Checking if user is on phone doing double hung
    if(window.innerWidth <= 576 && this.isDoubleHung()) {
      this.sharedDataService.windowWidth = newWidth;
      this.sharedDataService.windowHeight = newHeight;
      this.sharedDataService.bottomSashWidth = newBottomWidth;
      this.sharedDataService.bottomSashHeight = newBottomHeight;
      newDividerWindow = new DividerWindow(newWidth >= 100 ? newWidth : undefined, newHeight >= 100 ? newHeight : undefined, horzDividers, vertDividers, dividerWidth, 
      this.sharedDataService.selectedDividerType, 
      this.sharedDataService.selectedWindowShape.substring(0, 2) == "2x" ? true : false, 
      this.sharedDataService.bottomSashWidth, this.sharedDataService.bottomSashHeight);
    }
    // User is regular top sash
    else if(this.sharedDataService.topSash) {
      this.sharedDataService.windowWidth = newWidth;
      this.sharedDataService.windowHeight = newHeight;
      newDividerWindow = new DividerWindow(newWidth >= 100 ? newWidth : undefined, newHeight >= 100 ? newHeight : undefined, horzDividers, vertDividers, dividerWidth, 
      this.sharedDataService.selectedDividerType, 
      this.sharedDataService.selectedWindowShape.substring(0, 2) == "2x" ? true : false, 
      this.sharedDataService.bottomSashWidth, this.sharedDataService.bottomSashHeight);
    }
    // Regular bottom sash
    else {
      this.sharedDataService.bottomSashWidth = newWidth;
      this.sharedDataService.bottomSashHeight = newHeight;
      newDividerWindow = new DividerWindow(this.sharedDataService.windowWidth, this.sharedDataService.windowHeight, 
        horzDividers, vertDividers, dividerWidth, 
        this.sharedDataService.selectedDividerType, 
        this.sharedDataService.selectedWindowShape.substring(0, 2) == "2x" ? true : false, 
        newWidth >= 100 ? newWidth : undefined, newHeight >= 100 ? newHeight : undefined);
    }
    
    
    // Updating template dimensions
    document.getElementById("windowPerimeter")?.setAttribute("d", newDividerWindow.dString);
    document.getElementById("windowPerimeter")?.setAttribute("style", "fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:.2;");
    let viewboxValue:string = newDividerWindow.getViewbox();
    // if(this.isDoubleHung()) {
    //   viewboxValue = ""+ (-7 - (this.sharedDataService.windowWidth >= this.sharedDataService.bottomSashWidth ? 0 : (this.sharedDataService.bottomSashWidth - this.sharedDataService.windowWidth)/2)) +" "+ (-7) +" "+
    //   ((this.sharedDataService.windowWidth >= this.sharedDataService.bottomSashWidth ? this.sharedDataService.windowWidth : this.sharedDataService.bottomSashWidth)+14)+
    //   " "+(((this.sharedDataService.windowHeight + (this.sharedDataService.bottomSashHeight == -1 ? this.sharedDataService.windowHeight : this.sharedDataService.bottomSashHeight))+28));
      
    // }
    // else {viewboxValue = ""+ (-7) +" "+ (-7) +" "+(newWidth+14)+" "+(newHeight+14);}
    document.getElementById("dividerTemplate")?.setAttribute("viewBox", viewboxValue);

    let paneNum:number = 0;
    for(let row:number = 0; row < newDividerWindow.windowPanes.length; ++row) {
      for(let col:number = 0; col < newDividerWindow.windowPanes[row].length; ++col) {
        // Updating each individual pane
        document.getElementById("dividerPane"+paneNum)?.setAttribute("d", newDividerWindow.windowPanes[row][col].dString);
        document.getElementById("dividerPane"+paneNum)?.setAttribute("style", "fill-rule:evenodd;stroke:#000000;stroke-width:.2;");
        ++paneNum;
      }
      
    }

    this.sharedDataService.dividerWindow = newDividerWindow;
    this.sharedDataService.dividerWidth = dividerWidth;
    this.sharedDataService.dividerNumbers = [horzDividers, vertDividers];
  }

  // Function for optimized algorithm
  getPanelWidths(width:number):number[] {
    if(width <= 0) {return [-1];}
    let vertDividers:number = this.sharedDataService.dividerNumbers[1];
    let finalPanelWidth:number = 0; 
    let totalDividerWidth:number = 0;
    if(this.sharedDataService.selectedDividerType == 'nodiv') {
      finalPanelWidth = width;
      totalDividerWidth = 0;
    }
    else if(this.sharedDataService.selectedDividerType == 'embeddeddiv') {
      finalPanelWidth = width / (vertDividers+1);
      totalDividerWidth = 0;
    }
    // raised divs
    else {
      finalPanelWidth = ((width - (vertDividers*this.sharedDataService.dividerWidth)) / (vertDividers+1));
      totalDividerWidth = vertDividers*this.sharedDataService.dividerWidth;
    }
    if(finalPanelWidth >= 100) {
      let finalWidths:number[] = [];
      let reductionFactor:number = 1;
      while(finalPanelWidth/reductionFactor >= 100) {
        if(finalPanelWidth/reductionFactor >= 100 && finalPanelWidth/reductionFactor <= 386) {
          if((width-totalDividerWidth)/(finalPanelWidth/reductionFactor) <= (this.isDoubleHung() ? 3 : 6)) {
            finalWidths.push(finalPanelWidth/reductionFactor);
          }
        }
        ++reductionFactor;
      }
      return finalWidths;
    }
    else {return [-1];}
  }

  // Optimized height function
  getPanelHeights(height:number):number[] {
    if(height <= 0) {return [-1];}
    let horzDividers:number = this.sharedDataService.dividerNumbers[0];
    let finalPanelHeight:number = 0; 
    let totalDividerHeight:number = 0;
    if(this.sharedDataService.selectedDividerType == 'nodiv') {
      finalPanelHeight = height;
      totalDividerHeight = 0;
    }
    else if(this.sharedDataService.selectedDividerType == 'embeddeddiv') {
      finalPanelHeight = height / (horzDividers+1);
      totalDividerHeight = 0;
    }
    // raised divs
    else {
      finalPanelHeight = ((height - (horzDividers*this.sharedDataService.dividerWidth)) / (horzDividers+1));
      totalDividerHeight = (horzDividers*this.sharedDataService.dividerWidth);
    }

    //if(finalPanelHeight >= 100 && finalPanelHeight <= 386) {return finalPanelHeight;}
    if(finalPanelHeight >= 100) {
      let finalHeights:number[] = [];
      let reductionFactor:number = 1;
      while(finalPanelHeight/reductionFactor >= 100) {
        if(finalPanelHeight/reductionFactor >= 100 && finalPanelHeight/reductionFactor <= 386) {
          if((height-totalDividerHeight)/(finalPanelHeight/reductionFactor) <= (this.isDoubleHung() ? 3 : 6)) {
            finalHeights.push(finalPanelHeight/reductionFactor);
          }
        }
        ++reductionFactor;
      }
      return finalHeights;
    }
    else {return [-1];}
  }

  // Updating panel layout 2d array
  updatePanelLayout():void {
    // let topPanelWidth:number = this.getPanelWidth(this.sharedDataService.windowWidth);
    // let topPanelHeight:number = this.getPanelHeight(this.sharedDataService.windowHeight);
    // let bottomPanelWidth:number = this.getPanelWidth(this.sharedDataService.bottomSashWidth);
    // let bottomPanelHeight:number = this.getPanelHeight(this.sharedDataService.bottomSashHeight);
    // Getting possible widths and heights
    let topPanelWidths:number[] = this.getPanelWidths(this.sharedDataService.windowWidth);
    let topPanelHeights:number[] = this.getPanelHeights(this.sharedDataService.windowHeight);
    let bottomPanelWidths:number[] = this.getPanelWidths(this.sharedDataService.bottomSashWidth);
    let bottomPanelHeights:number[] = this.getPanelHeights(this.sharedDataService.bottomSashHeight);

    // Getting optimal widths and heights by checking every combination for top panels
    let bestCombo:number[] = [0, 0];
    let widthHeightRatio = topPanelWidths[0] / topPanelHeights[0];
    let acceptableCombos:number[][] = [];
    for(let widthIndex:number = 0; widthIndex < topPanelWidths.length; ++widthIndex) {
      for(let heightIndex:number = 0; heightIndex < topPanelHeights.length; ++heightIndex) {
        if(Math.abs(1 - topPanelWidths[widthIndex] / topPanelHeights[heightIndex]) <= Math.abs(1 - widthHeightRatio)) {
          // Met the requirements within a 6x6 template of ratio .75-1.33
          if((topPanelWidths[widthIndex] / topPanelHeights[heightIndex]) <= 1.33 && (topPanelWidths[widthIndex] / topPanelHeights[heightIndex]) >= .75) {
            acceptableCombos.push([widthIndex, heightIndex]);
          }
          bestCombo = [widthIndex, heightIndex];
          widthHeightRatio = topPanelWidths[widthIndex] / topPanelHeights[heightIndex];
        }
      }
    }
    // Getting the best width and height
    let topPanelWidth:number = acceptableCombos.length > 0 ? topPanelWidths[acceptableCombos[0][0]] : topPanelWidths[bestCombo[0]];
    let topPanelHeight:number = acceptableCombos.length > 0 ? topPanelHeights[acceptableCombos[0][1]] : topPanelHeights[bestCombo[1]];

    // Getting optimal bottom widths and heights by checking every combination for bottom panels
    bestCombo = [0, 0];
    widthHeightRatio = bottomPanelWidths[0] / bottomPanelHeights[0];
    acceptableCombos = [];
    for(let widthIndex:number = 0; widthIndex < bottomPanelWidths.length; ++widthIndex) {
      for(let heightIndex:number = 0; heightIndex < bottomPanelHeights.length; ++heightIndex) {
        if(Math.abs(1 - bottomPanelWidths[widthIndex] / bottomPanelHeights[heightIndex]) <= Math.abs(1 - widthHeightRatio)) {
          // Met the requirements within a 6x6 template of ratio .75-1.33
          if((bottomPanelWidths[widthIndex] / bottomPanelHeights[heightIndex]) <= 1.33 && (bottomPanelWidths[widthIndex] / bottomPanelHeights[heightIndex]) >= .75) {
            acceptableCombos.push([widthIndex, heightIndex]);
          }
          bestCombo = [widthIndex, heightIndex];
          widthHeightRatio = bottomPanelWidths[widthIndex] / bottomPanelHeights[heightIndex];
        }
      }
    }
    let bottomPanelWidth:number = acceptableCombos.length > 0 ? bottomPanelWidths[acceptableCombos[0][0]] : bottomPanelWidths[bestCombo[0]];
    let bottomPanelHeight:number = acceptableCombos.length > 0 ? bottomPanelHeights[acceptableCombos[0][1]] : bottomPanelHeights[bestCombo[1]];

    
    let topLeftRight:number = Math.floor(this.sharedDataService.windowWidth/topPanelWidth);
    let topTopBottom:number = Math.floor(this.sharedDataService.windowHeight/topPanelHeight);
    let bottomLeftRight:number = Math.floor(this.sharedDataService.bottomSashWidth/bottomPanelWidth);
    let bottomTopBottom:number = Math.floor(this.sharedDataService.bottomSashHeight/bottomPanelHeight);
    
    // let panelWidth:number = this.getPanelWidth(this.sharedDataService.windowWidth);
    // let panelHeight:number = this.getPanelHeight(this.sharedDataService.windowHeight);
    // let leftRight:number = Math.floor(this.sharedDataService.windowWidth/panelWidth);
    
    if(this.isDoubleHung() && topLeftRight != bottomLeftRight) {this.sharedDataService.panelLayoutDims = [-1, -1];}
    else {
      if(topTopBottom == -1 || (this.isDoubleHung() && bottomTopBottom == -1) || topLeftRight == -1) {this.sharedDataService.panelLayoutDims = [-1, -1];}
      else {
        let topBottom:number = this.isDoubleHung() ? topTopBottom + bottomTopBottom : topTopBottom;
        this.sharedDataService.panelLayout = [];
        for(let i:number = 0; i < topTopBottom; ++i) {
          this.sharedDataService.panelLayout.push([]);
        }
        this.sharedDataService.panelLayoutDims = [topLeftRight, topBottom];
        
      }
      
    }
  }

}
