import { Component, OnInit, Input } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { DesignWindowComponent } from '../design-window/design-window.component';

@Component({
  selector: 'app-colors-selection-button',
  templateUrl: './colors-selection-button.component.html',
  styleUrls: ['./colors-selection-button.component.css']
})
export class ColorsSelectionButtonComponent implements OnInit {
  // Array holding all colors currently offered with corresponding hex values
  colorsData:{id:number, value:string, hex:string}[];
  constructor(private sharedDataService:SharedDataService) { }

  // Method to change color of currently selected panes
  changePanesColor(hexValue:string):void {
    document.getElementById("button_"+this.sharedDataService.currentColor)?.setAttribute("style", "");
    //let currentPaneID:string = this.sharedDataService.currentPaneID;
    //document.getElementById(currentPaneID)?.setAttribute("style", "fill:#"+hexValue+";opacity:.9");
    document.getElementById("button_"+hexValue)?.setAttribute("style", "border:1px solid #0000ff");
    this.sharedDataService.currentColor = hexValue;
  }

  ngOnInit(): void {
    // Getting the colors from the shared data service
    this.colorsData = this.sharedDataService.colorsData;
  }
}
