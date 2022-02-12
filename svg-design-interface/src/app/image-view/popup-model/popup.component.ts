import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ImageObj } from '../ImageObj';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit {
  @Input()
  lessons!: ImageObj[];
  lesson!: ImageObj;
  constructor(public activeModal: NgbActiveModal) { }
  ngOnInit(): void {
    this.lesson = this.lessons[0];
  }

  color_change_status = 0;

  blue_button(): void {
    this.color_change_status = 1;

  }

  red_button(): void {
    this.color_change_status = 2;

  }

  green_button(): void {
    this.color_change_status = 3;

  }

  black_button(): void {
    this.color_change_status = 4;
  }

  yellow_button(): void {
    this.color_change_status = 5;
  }

  white_button(): void {
    this.color_change_status = 6;
  }

  magenta_button(): void {
    this.color_change_status = 7;
  }

  orange_button(): void {
    this.color_change_status = 8;
  }

  cyan_button(): void {
    this.color_change_status = 9;
  }
  
  lime_button(): void {
    this.color_change_status = 10;
  }

  clear_button(): void {
    this.color_change_status = 0;

  }

  edit(l: ImageObj) {
    this.lesson = l;
  }

  resize_width(): void {
    var width = (<HTMLInputElement>document.getElementById("width")).value;
    // alert(width);
    var width_obj = document.getElementById("sizing");
    var w_px: number = +width * 305;
    width_obj?.setAttribute("style", "transform: scale(" + width + ", var(--height-size)); left: " + w_px + "px" + ";");

  }

  resize_height(): void {
    var height = (<HTMLInputElement>document.getElementById("height")).value;
    // alert(height);
    var height_obj = document.getElementById("sizing");
    var h_px: number = +height * 300;
    height_obj?.setAttribute("style", "transform: scale(var(--width-size), " + height + "); top: " + h_px + "px" + ";");

  }

}
