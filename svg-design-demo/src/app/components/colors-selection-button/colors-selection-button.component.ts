import { Component, OnInit, Input } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { DesignWindowComponent } from '../design-window/design-window.component';
declare var $:any;

@Component({
  selector: 'app-colors-selection-button',
  templateUrl: './colors-selection-button.component.html',
  styleUrls: ['./colors-selection-button.component.css']
})
export class ColorsSelectionButtonComponent implements OnInit {

  @Input() paneColors:boolean;

  // Array holding all colors currently offered with corresponding hex values
  colorsData:{id:number, name:string, hex:string, paneColor:boolean}[];
  constructor(private sharedDataService:SharedDataService) { }

  // Method to change color of currently selected panes
  changePanesColor(hexValue:string, paneColor:boolean):void {
    //let currentPaneID:string = this.sharedDataService.currentPaneID;
    //document.getElementById(currentPaneID)?.setAttribute("style", "fill:#"+hexValue+";opacity:.9");
    if(paneColor) {
      document.getElementById("button_"+this.sharedDataService.currentPaneColor+"_true")?.setAttribute("style", "");
      document.getElementById("button_"+hexValue+"_true")?.setAttribute("style", "border:1px solid #0000ff");
      this.sharedDataService.currentPaneColor = hexValue;
    }
    else {
      document.getElementById("button_"+this.sharedDataService.currentFilamentColor+"_false")?.setAttribute("style", "");
      document.getElementById("button_"+hexValue+"_false")?.setAttribute("style", "border:1px solid #0000ff");
      this.sharedDataService.currentFilamentColor = hexValue;
      document.getElementById("svgTemplate")?.setAttribute("style", "fill:#"+this.sharedDataService.currentFilamentColor);
      for(let i = 0; i < this.sharedDataService.panelLayoutDims[0]*this.sharedDataService.panelLayoutDims[1]; ++i) {
        document.getElementById("windowSVG"+i)?.setAttribute("style", "fill:#"+this.sharedDataService.currentFilamentColor+";");
        document.getElementById("windowSVGFinished"+i)?.setAttribute("style", "fill:#"+this.sharedDataService.currentFilamentColor+";");
      }
    }
  }

  ngOnInit(): void {
    $('[data-toggle="tooltip"]').tooltip();
    // Getting the colors from the shared data service
    if(this.paneColors == true) {this.colorsData = this.sharedDataService.colorsData;}
    else {this.colorsData = this.sharedDataService.filamentColorsData;}
    
  }
}
