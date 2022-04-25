import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-stage4',
  templateUrl: './stage4.component.html',
  styleUrls: ['./stage4.component.css']
})
export class Stage4Component implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  prestage3() {
    document.getElementById("stage3")?.scrollIntoView({behavior: 'smooth'});
  }

  nextstage5() {
    document.getElementById("stage5")?.scrollIntoView({behavior: 'smooth'});
  }
}
