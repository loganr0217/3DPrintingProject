import { Component, OnInit, Input } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { DesignWindowComponent } from '../design-window/design-window.component';

@Component({
  selector: 'app-colors-selection-button',
  templateUrl: './colors-selection-button.component.html',
  styleUrls: ['./colors-selection-button.component.css']
})
export class ColorsSelectionButtonComponent implements OnInit {

  @Input() paneColors:boolean;
  @Input() tdiPage:boolean;

  // Array holding all colors currently offered with corresponding hex values
  colorsData:{id:number, name:string, hex:string, darkHex:string, paneColor:boolean, isAvailable:boolean, placementID:number, opacity:number, darkOpacity:number}[];
  constructor(public sharedDataService:SharedDataService) { }

  // Method to change color of currently selected panes
  changePanesColor(hexValue:string, paneColor:boolean):void {
    //let currentPaneID:string = this.sharedDataService.currentPaneID;
    //document.getElementById(currentPaneID)?.setAttribute("style", "fill:#"+hexValue+";opacity:.9");
    if(paneColor) {
      // document.getElementById("button_"+this.sharedDataService.currentPaneColor+"_true")?.setAttribute("style", "background-color:#"+this.sharedDataService.currentPaneColor);
      // document.getElementById("button_"+hexValue+"_true")?.setAttribute("style", "border:2px solid #0000ff; background-color:#"+hexValue);
      this.sharedDataService.currentPaneColor = hexValue;
    }
    else {
      // document.getElementById("button_"+this.sharedDataService.currentFilamentColor+"_false")?.setAttribute("style", "background-color:#"+this.sharedDataService.currentPaneColor);
      // document.getElementById("button_"+hexValue+"_false")?.setAttribute("style", "border:1px solid #0000ff; background-color:#"+hexValue);
      this.sharedDataService.currentFilamentColor = hexValue;
      document.getElementById("svgTemplate")?.setAttribute("style", "fill:#"+this.sharedDataService.currentFilamentColor);
      for(let i = 0; i < this.sharedDataService.panelLayoutDims[0]*this.sharedDataService.panelLayoutDims[1]; ++i) {
        document.getElementById("windowSVG"+i)?.setAttribute("style", "fill:#"+this.sharedDataService.currentFilamentColor+";");
        document.getElementById("windowSVGFinished"+i)?.setAttribute("style", "fill:#"+this.sharedDataService.currentFilamentColor+";");
      }
    }
  }

  hexOpacityToRGBA(hex:string, opacity:number):string {
    let r:string = "0x"+hex.substring(0,2);
    let g:string = "0x"+hex.substring(2,4);
    let b:string = "0x"+hex.substring(4,6);
    
    return "rgba("+Number(r)+","+Number(g)+","+Number(b)+","+opacity+")";
  }

  isColorCurrentlySelected(hexValue:string, paneColor:boolean):boolean {
    if(this.sharedDataService.currentSelectedColor == undefined) {return false;}
    return this.sharedDataService.currentSelectedColor.hex == hexValue;
  }

  updateSelectedColor(color: {id:number, name:string, hex:string, darkHex:string, paneColor:boolean, isAvailable:boolean, placementID:number, opacity:number, darkOpacity:number}):void {
    this.sharedDataService.currentSelectedColor = color;
  }

  ngOnInit(): void {
    // Getting the colors from the shared data service
    if(this.paneColors == true) {this.colorsData = this.sharedDataService.colorsData;}
    else {this.colorsData = this.sharedDataService.tdiColorsData;}
    
  }

  isDarkMode():boolean {
    return (<HTMLInputElement>document.getElementById("customSwitch_DarkMode"))?.checked;
  }
}
