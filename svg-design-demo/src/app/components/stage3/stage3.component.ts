import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
@Component({
  selector: 'app-stage3',
  templateUrl: './stage3.component.html',
  styleUrls: ['./stage3.component.css']
})
export class Stage3Component implements OnInit {

  constructor(private sharedDataService:SharedDataService) { }

  ngOnInit(): void {
  }

  changeUnits(unitChoice:string):void {
    this.sharedDataService.unitChoice = unitChoice;
    // Updating the placeholders for each input
    document.getElementById("widthUnits")!.textContent = unitChoice;
    document.getElementById("heightUnits")!.textContent = unitChoice;
    document.getElementById("dividerWidthUnits")!.textContent = unitChoice;
  }

  prestage2BCon() {
    document.getElementById("stage2BCon")?.scrollIntoView({behavior: 'smooth'});
  }
  nextstage4() {
    document.getElementById("stage4")?.setAttribute("style", "visibility:visible;")
    document.getElementById("stage4")?.scrollIntoView({behavior: 'smooth'});
  }
  
}
