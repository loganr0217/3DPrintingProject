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

  constructor(private sharedDataService:SharedDataService) { }

  ngOnInit(): void {
    // Starts selectedDividerPane at 0
    this.selectedDividerPane = 0;
  }

  // Updates the selected pane selected by the user (specifically for divider-window)
  updateSelectedDividerPane(paneID:number):void {
    const selectedPaneRow:number = Math.floor(this.selectedDividerPane/this.sharedDataService.dividerWindow.numberHorizontalPanes);
    const selectedPaneCol:number = this.selectedDividerPane%this.sharedDataService.dividerWindow.numberHorizontalPanes;
    if(this.sharedDataService.dividerWindow.windowPanes[selectedPaneRow][selectedPaneCol].sizeAdjusted == true) {
      document.getElementById("dividerPane"+this.selectedDividerPane)?.setAttribute("style", "fill:#FFCCCB;fill-rule:evenodd;stroke:#000000;stroke-width:.2;");
    }
    else {document.getElementById("dividerPane"+this.selectedDividerPane)?.setAttribute("style", "fill:#FFFFFF;fill-rule:evenodd;stroke:#000000;stroke-width:.2;");}
    
    document.getElementById("dividerPane"+paneID)?.setAttribute("style", "fill:#666666;fill-rule:evenodd;stroke:#000000;stroke-width:.2;");
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
        this.sharedDataService.dividerWindow.windowPanes[paneRow][i].sizeAdjusted == false) {
        ++numberHorizontalUnadjusted;
        remainingWidth += this.sharedDataService.dividerWindow.windowPanes[paneRow][i].width;
      }
      if(i < this.sharedDataService.dividerWindow.numberVerticalPanes && i != paneRow && 
        this.sharedDataService.dividerWindow.windowPanes[i][paneCol].sizeAdjusted == false) {
        ++numberVerticalUnadjusted;
        remainingHeight += this.sharedDataService.dividerWindow.windowPanes[i][paneCol].height;
      }
    }

    let paneNumber:number = paneRow*this.sharedDataService.dividerWindow.numberHorizontalPanes;
    // Changing width/height if able to 
    if((numberHorizontalUnadjusted > 0 && newWidth <= remainingWidth) || (numberVerticalUnadjusted > 0 && newHeight <= remainingHeight)) {
      // Fixing newWidth and newHeight in case they input something bad
      if(newWidth >= remainingWidth) {newWidth = originalWidth;}
      if(newHeight >= remainingHeight) {newHeight = originalHeight;}

      // Values for the remaining unadjusted panes
      const remainingPaneOriginalWidth:number = remainingWidth/numberHorizontalUnadjusted;
      const remainingPaneNewWidth:number = (remainingWidth-(newWidth-originalWidth))/numberHorizontalUnadjusted;

      let numberHorizontalAdjustedBefore:number = 0;
      let numberHorizontalAdjustedAfter:number = (this.sharedDataService.dividerWindow.numberHorizontalPanes-1) - numberHorizontalUnadjusted;
      let numberVerticalAjustedBefore:number = 0;
      let newStartingPoint:number[];
      for(let col = 0; col < this.sharedDataService.dividerWindow.numberHorizontalPanes; ++col) {
        // Changing the starting point depending on if the pane is before or after the selected one
        newStartingPoint = this.sharedDataService.dividerWindow.windowPanes[paneRow][col].startPoint;
        if(col != 0 && col <= paneCol) {
          newStartingPoint[0] += (col-numberHorizontalAdjustedBefore)*(remainingPaneNewWidth-remainingPaneOriginalWidth);
        }
        else if(col != 0) {
          newStartingPoint[0] -= (
            ((this.sharedDataService.dividerWindow.numberHorizontalPanes - col) 
            - numberHorizontalAdjustedAfter) * (remainingPaneNewWidth-remainingPaneOriginalWidth));
        }

        // Not adjusted yet (able to be edited in terms of width/height)
        if(this.sharedDataService.dividerWindow.windowPanes[paneRow][col].sizeAdjusted == false || col == paneCol) {
          if(col != paneCol) {
            this.sharedDataService.dividerWindow.windowPanes[paneRow][col].updateWindowPane(remainingPaneNewWidth, this.sharedDataService.dividerWindow.windowPanes[paneRow][col].height, 
              newStartingPoint);
            document.getElementById("dividerPane"+paneNumber)?.setAttribute("style", "fill:#FFFFFF;fill-rule:evenodd;stroke:#000000;stroke-width:.2;");
          }
          else {
            this.sharedDataService.dividerWindow.windowPanes[paneRow][col].updateWindowPane(newWidth, originalHeight, 
              newStartingPoint);
            document.getElementById("dividerPane"+paneNumber)?.setAttribute("style", "fill:#FFCCCB;fill-rule:evenodd;stroke:#000000;stroke-width:.2;");
          } 
        }
        // Already adjusted 
        else {
          if(col == paneCol) {
            this.sharedDataService.dividerWindow.windowPanes[paneRow][col].updateWindowPane(newWidth, originalHeight, 
              newStartingPoint);
          }
          else {
            this.sharedDataService.dividerWindow.windowPanes[paneRow][col].updateWindowPane(undefined, undefined, 
              newStartingPoint);
          }
          ++numberHorizontalAdjustedBefore;
          --numberHorizontalAdjustedAfter;
        }
        document.getElementById("dividerPane"+paneNumber)?.setAttribute("d", this.sharedDataService.dividerWindow.windowPanes[paneRow][col].dString);
        ++paneNumber;
      }
      this.sharedDataService.dividerWindow.windowPanes[paneRow][paneCol].sizeAdjusted = true;
    }
  }

  // Returns 0 to n-1 (mainly used for iterating svg path items)
  range(n:number=this.sharedDataService.maxPanes):number[] {
    return [...Array(n).keys()];
  }

}
