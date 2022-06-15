import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
@Component({
  selector: 'app-stage5',
  templateUrl: './stage5.component.html',
  styleUrls: ['./stage5.component.css']
})
export class Stage5Component implements OnInit {

  constructor(private sharedDataService:SharedDataService) { }

  getWindowWidth():string {
    return "Width: " + this.sharedDataService.windowWidth + this.sharedDataService.unitChoice;
  }

  getWindowHeight():string {
    return "Height: " + this.sharedDataService.windowHeight + this.sharedDataService.unitChoice;
  }

  ngOnInit(): void {
  }

  saveDesign():void {
    //
  }

  goToStage4():void {
    document.getElementById("stage4")?.setAttribute("style", "visibility:visible;")
    document.getElementById("stage4")?.scrollIntoView({behavior: 'smooth'});
  }
  nextstageCheckout() {
    document.getElementById("checkoutStage")?.setAttribute("style", "visibility:visible;")
    document.getElementById("checkoutStage")?.scrollIntoView({behavior: 'smooth'});
  }

}
