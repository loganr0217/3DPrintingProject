import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tutorials-page',
  templateUrl: './tutorials-page.component.html',
  styleUrls: ['./tutorials-page.component.css']
})
export class TutorialsPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  goTdiInfo():void {
    document.getElementById("tdiInfo")?.scrollIntoView({behavior: 'smooth'});
  }

  goMeasurementInfo():void {
    document.getElementById("measurementInfo")?.scrollIntoView({behavior: 'smooth'});
  }

  goInstallationInfo():void {
    document.getElementById("installationInfo")?.scrollIntoView({behavior: 'smooth'});
  }

}
