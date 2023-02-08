import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { SVGTemplate, Polygon, DividerWindow, WindowPane } from '../svgScaler';

@Component({
  selector: 'app-divider-window',
  templateUrl: './divider-window.component.html',
  styleUrls: ['./divider-window.component.css']
})

export class DividerWindowComponent implements OnInit {
  selectedDividerPane:number;
  selectedDividerPaneWidth:number;
  selectedDividerPaneHeight:number;

  constructor(private sharedDataService:SharedDataService) { }

  ngOnInit(): void {
    // Starts selectedDividerPane at 0
    this.selectedDividerPane = 0;
  }

  // Updates the selected pane selected by the user (specifically for divider-window)
  updateSelectedDividerPane(paneID:number):void {
    // Getting values for currently selected and new pane
    const selectedPaneRow:number = Math.floor(this.selectedDividerPane/this.sharedDataService.dividerWindow.numberHorizontalPanes);
    const selectedPaneCol:number = this.selectedDividerPane%this.sharedDataService.dividerWindow.numberHorizontalPanes;
    const newPaneRow:number = Math.floor(paneID/this.sharedDataService.dividerWindow.numberHorizontalPanes);
    const newPaneCol:number = paneID%this.sharedDataService.dividerWindow.numberHorizontalPanes;

    let numberHorizontalUnadjusted:number = 0;
    let numberVerticalUnadjusted:number = 0;
    // Looping through to get the number of unadjusted panes and remaining space to edit
    const maxIndex:number = (this.sharedDataService.dividerWindow.numberHorizontalPanes >= 
      this.sharedDataService.dividerWindow.numberVerticalPanes ? 
      this.sharedDataService.dividerWindow.numberHorizontalPanes : this.sharedDataService.dividerWindow.numberVerticalPanes);
      for(let i = 0; i < maxIndex; ++i) {
        if(i < this.sharedDataService.dividerWindow.numberHorizontalPanes && i != selectedPaneCol && 
          this.sharedDataService.dividerWindow.windowPanes[selectedPaneRow][i].widthAdjusted == false) {
          ++numberHorizontalUnadjusted;
        }
        if(i < this.sharedDataService.dividerWindow.numberVerticalPanes && i != selectedPaneRow && 
          this.sharedDataService.dividerWindow.windowPanes[i][selectedPaneCol].heightAdjusted == false) {
          ++numberVerticalUnadjusted;
        }
      }

    // Changing colors of selected panes
    if(this.sharedDataService.dividerWindow.windowPanes[selectedPaneRow][selectedPaneCol].widthAdjusted == true && 
      this.sharedDataService.dividerWindow.windowPanes[selectedPaneRow][selectedPaneCol].heightAdjusted == true || (numberHorizontalUnadjusted == 0 && numberVerticalUnadjusted == 0)) {
      document.getElementById("dividerPane"+this.selectedDividerPane)?.setAttribute("style", "fill:#FFCCCB;fill-rule:evenodd;stroke:#000000;stroke-width:.2;");
    }
    else if(this.sharedDataService.dividerWindow.windowPanes[selectedPaneRow][selectedPaneCol].widthAdjusted || (numberHorizontalUnadjusted == 0)) {
      document.getElementById("dividerPane"+this.selectedDividerPane)?.setAttribute("style", "fill:#BBBBBB;fill-rule:evenodd;stroke:#000000;stroke-width:.2;");
    }
    else if(this.sharedDataService.dividerWindow.windowPanes[selectedPaneRow][selectedPaneCol].heightAdjusted || numberVerticalUnadjusted == 0) {
      document.getElementById("dividerPane"+this.selectedDividerPane)?.setAttribute("style", "fill:#000000;fill-rule:evenodd;stroke:#000000;stroke-width:.2;");
    }
    else {document.getElementById("dividerPane"+this.selectedDividerPane)?.setAttribute("style", "fill:#FFFFFF;fill-rule:evenodd;stroke:#000000;stroke-width:.2;");}
    
    document.getElementById("dividerPane"+paneID)?.setAttribute("style", "fill:#666666;fill-rule:evenodd;stroke:#000000;stroke-width:.2;");
    this.selectedDividerPaneWidth = this.sharedDataService.dividerWindow.windowPanes[newPaneRow][newPaneCol].width;
    this.selectedDividerPaneHeight = this.sharedDataService.dividerWindow.windowPanes[newPaneRow][newPaneCol].height;
    this.selectedDividerPane = paneID;
  }

  // Method to update the dimensions for a given pane (it automatically resizes non adjusted panes)
  updateDividerPaneDimensions():void {
    const paneID:number = this.selectedDividerPane;

    // Getting new width and height that user gives us
    let newWidth:number = Number((<HTMLInputElement>document.getElementById("dividerPaneWidthInput")).value);
    let newHeight:number = Number((<HTMLInputElement>document.getElementById("dividerPaneHeightInput")).value);
    
    // Converting paneID to a row,col pair
    let paneRow:number = Math.floor(paneID / this.sharedDataService.dividerWindow.numberHorizontalPanes);
    let paneCol:number = paneID % this.sharedDataService.dividerWindow.numberHorizontalPanes;
    
    // Getting pane's original dimensions
    let originalWidth:number = this.sharedDataService.dividerWindow.windowPanes[paneRow][paneCol].width;
    let originalHeight:number = this.sharedDataService.dividerWindow.windowPanes[paneRow][paneCol].height;
    
    // Getting info about the remaining unadjusted panes
    let numberHorizontalUnadjusted:number = 0;
    let numberVerticalUnadjusted:number = 0;
    let remainingWidth:number = 0;
    let remainingHeight:number = 0;

    // Looping through to get the number of unadjusted panes and remaining space to edit
    const maxIndex:number = (this.sharedDataService.dividerWindow.numberHorizontalPanes >= 
    this.sharedDataService.dividerWindow.numberVerticalPanes ? 
    this.sharedDataService.dividerWindow.numberHorizontalPanes : this.sharedDataService.dividerWindow.numberVerticalPanes);
    for(let i = 0; i < maxIndex; ++i) {
      if(i < this.sharedDataService.dividerWindow.numberHorizontalPanes && i != paneCol && 
        this.sharedDataService.dividerWindow.windowPanes[paneRow][i].widthAdjusted == false) {
        ++numberHorizontalUnadjusted;
        remainingWidth += this.sharedDataService.dividerWindow.windowPanes[paneRow][i].width;
      }
      if(i < this.sharedDataService.dividerWindow.numberVerticalPanes && i != paneRow && 
        this.sharedDataService.dividerWindow.windowPanes[i][paneCol].heightAdjusted == false) {
        ++numberVerticalUnadjusted;
        remainingHeight += this.sharedDataService.dividerWindow.windowPanes[i][paneCol].height;
      }
    }

    // Fixing newWidth and newHeight in case they input something bad
    if(newWidth > remainingWidth) {newWidth = originalWidth;}
    if(newHeight > remainingHeight) {newHeight = originalHeight;}
    
    // Changing width/height if able to 
    if(1) {

      // Values for the remaining unadjusted panes
      const remainingPaneOriginalWidth:number = remainingWidth/numberHorizontalUnadjusted;
      const remainingPaneNewWidth:number = (remainingWidth-(newWidth-originalWidth))/numberHorizontalUnadjusted;
      const remainingPaneOriginalHeight:number = remainingHeight/numberVerticalUnadjusted;
      const remainingPaneNewHeight:number = (remainingHeight-(newHeight-originalHeight))/numberVerticalUnadjusted;

      // Initializing values for vertical panes
      let numberVerticalAdjustedBefore:number = 0;
      let numberVerticalAdjustedAfter:number = (this.sharedDataService.dividerWindow.numberVerticalPanes-1) - numberVerticalUnadjusted;
      // Looping through each row of panes
      for(let row = 0; row < this.sharedDataService.dividerWindow.numberVerticalPanes; ++row) {
        // Initializing values for horizontal panes
        let paneNumber:number = row*this.sharedDataService.dividerWindow.numberHorizontalPanes;
        let numberHorizontalAdjustedBefore:number = 0;
        let numberHorizontalAdjustedAfter:number = (this.sharedDataService.dividerWindow.numberHorizontalPanes-1) - numberHorizontalUnadjusted;
        let isVerticalAdjusted:boolean = false;
        
        // Looping through each column of panes
        for(let col = 0; col < this.sharedDataService.dividerWindow.numberHorizontalPanes; ++col) {
          // Changing the starting point depending on if the pane is before or after the selected one
          let newStartingPoint:number[] = this.sharedDataService.dividerWindow.windowPanes[row][col].startPoint;
          if(col != 0 && col <= paneCol && newWidth <= remainingWidth) {
            newStartingPoint[0] += (col-numberHorizontalAdjustedBefore)*(remainingPaneNewWidth-remainingPaneOriginalWidth);
          }
          else if(col != 0 && newWidth <= remainingWidth) {
            newStartingPoint[0] -= (
              ((this.sharedDataService.dividerWindow.numberHorizontalPanes - col) 
              - numberHorizontalAdjustedAfter) * (remainingPaneNewWidth-remainingPaneOriginalWidth));
          }
          if(row != 0 && row <= paneRow && newHeight <= remainingHeight) {
            newStartingPoint[1] += (row-numberVerticalAdjustedBefore)*(remainingPaneNewHeight-remainingPaneOriginalHeight);
          }
          else if(row != 0 && newHeight <= remainingHeight) {
            newStartingPoint[1] -= (
              ((this.sharedDataService.dividerWindow.numberVerticalPanes - row) 
              - numberVerticalAdjustedAfter) * (remainingPaneNewHeight-remainingPaneOriginalHeight));
          }
          // Not adjusted yet (able to be edited in terms of width/height)
          if((this.sharedDataService.dividerWindow.windowPanes[row][col].widthAdjusted == false &&  
            this.sharedDataService.dividerWindow.windowPanes[row][col].heightAdjusted == false) ||
            (col == paneCol && row == paneRow)) {
            this.sharedDataService.dividerWindow.windowPanes[row][col].updateWindowPane(
              (col != paneCol ? (newWidth <= remainingWidth ? remainingPaneNewWidth : undefined) : newWidth), 
              (row != paneRow ? (newHeight <= remainingHeight ? remainingPaneNewHeight : undefined) : newHeight), 
              newStartingPoint);
            document.getElementById("dividerPane"+paneNumber)?.setAttribute("style", 
              ((col != paneCol && row != paneRow) ? "fill:#FFFFFF;" : "fill:#FFCCCB;") +
              "fill-rule:evenodd;stroke:#000000;stroke-width:.2;");
              
          }
          // Already adjusted in either width or height
          else {
            // Ternary operator to avoid a bunch of nested loops --> stays the same if it was already adjusted
            //  and updates the height/width to either the newWidth or remainingWidth/Height depending on row/col
            this.sharedDataService.dividerWindow.windowPanes[row][col].updateWindowPane(
              (col == paneCol && newWidth <= remainingWidth ? newWidth : 
                (this.sharedDataService.dividerWindow.windowPanes[row][col].widthAdjusted || newWidth > remainingWidth ? undefined : remainingPaneNewWidth)), 
              (row == paneRow && newHeight <= remainingHeight ? newHeight :
                (this.sharedDataService.dividerWindow.windowPanes[row][col].heightAdjusted || newHeight > remainingHeight ? undefined : remainingPaneNewHeight)), 
              newStartingPoint);
            if(this.sharedDataService.dividerWindow.windowPanes[row][col].widthAdjusted && col != paneCol) {
              ++numberHorizontalAdjustedBefore;
              --numberHorizontalAdjustedAfter;
            }
            if(this.sharedDataService.dividerWindow.windowPanes[row][col].heightAdjusted && row != paneRow) {isVerticalAdjusted = true;}
          }
          document.getElementById("dividerPane"+paneNumber)?.setAttribute("d", this.sharedDataService.dividerWindow.windowPanes[row][col].dString);
          ++paneNumber;
          // Updating this pane's sizeAdjusted values
          if(row == paneRow) {this.sharedDataService.dividerWindow.windowPanes[row][col].heightAdjusted = true;}
          if(col == paneCol) {this.sharedDataService.dividerWindow.windowPanes[row][col].widthAdjusted = true;}
        }
        if(isVerticalAdjusted) {
          ++numberVerticalAdjustedBefore;
          --numberVerticalAdjustedAfter;
        }
      }
      
    }
  }

  // Returns 0 to n-1 (mainly used for iterating svg path items)
  range(n:number=this.sharedDataService.maxPanes):number[] {
    return [...Array(n).keys()];
  }

  isActiveSashPane(paneId:number):boolean {
    if(!this.sharedDataService.isDoubleHung()) {return true;}

    if(this.sharedDataService.topSash) {
      return paneId < (this.sharedDataService.dividerWindow.numberVerticalPanes*this.sharedDataService.dividerWindow.numberHorizontalPanes);
    }
    return paneId >= (this.sharedDataService.dividerWindow.numberVerticalPanes*this.sharedDataService.dividerWindow.numberHorizontalPanes);
    
  }

}
