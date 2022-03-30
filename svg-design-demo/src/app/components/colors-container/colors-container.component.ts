import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-colors-container',
  templateUrl: './colors-container.component.html',
  styleUrls: ['./colors-container.component.css']
})
export class ColorsContainerComponent implements OnInit {
  @Input() paneColors:boolean;
  constructor() { }

  ngOnInit(): void {
  }

}
