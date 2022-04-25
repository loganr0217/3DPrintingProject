import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-stage3',
  templateUrl: './stage3.component.html',
  styleUrls: ['./stage3.component.css']
})
export class Stage3Component implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  prestage2BCon() {
    document.getElementById("stage2BCon")?.scrollIntoView({behavior: 'smooth'});
  }

  nextstage4() {
    document.getElementById("stage4")?.scrollIntoView({behavior: 'smooth'});
  }
  
}
