import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { DesignWindowComponent } from '../design-window/design-window.component';
import { tap, takeWhile } from 'rxjs/operators';
import { interval } from 'rxjs';


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

  @ViewChild('scroll') scroll: ElementRef;

  scrollRight(){
    //for some reason .scrollRight would not work so just changed scrollLeft values
    this.scroll.nativeElement.scrollLeft += 50;
  
  }

  scrollLeft(){
    this.scroll.nativeElement.scrollLeft -= 50;
  }

  ngOnInit(): void {
    // Getting the colors from the shared data service
    this.colorsData = this.sharedDataService.colorsData;
  }
  
}


