import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-stage2',
  templateUrl: './stage2.component.html',
  styleUrls: ['./stage2.component.css']
})
export class Stage2Component implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  color_change_status = 0;

  click_button1(): void {
    this.color_change_status = 1;
  }
  click_button2(): void {
    this.color_change_status = 2;
  }
  click_button3(): void {
    this.color_change_status = 3;
  }
  click_button4(): void {
    this.color_change_status = 4;
  }
  click_button5(): void {
    this.color_change_status = 5;
  }
  click_button6(): void {
    this.color_change_status = 6;
  }
  click_button7(): void {
    this.color_change_status = 7;
  }
  click_button8(): void {
    this.color_change_status = 8;
  }
  click_button9(): void {
    this.color_change_status = 9;
  }

}
