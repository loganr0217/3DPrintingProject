import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about-page',
  templateUrl: './about-page.component.html',
  styleUrls: ['./about-page.component.css']
})
export class AboutPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  goReleaseNotes():void {
    document.getElementById("releaseNotes")?.scrollIntoView({behavior: 'smooth'});
  }

  goMeasurementInfo():void {
    document.getElementById("measurementInfo")?.scrollIntoView({behavior: 'smooth'});
  }

  goInstallationInfo():void {
    document.getElementById("installationInfo")?.scrollIntoView({behavior: 'smooth'});
  }
}
