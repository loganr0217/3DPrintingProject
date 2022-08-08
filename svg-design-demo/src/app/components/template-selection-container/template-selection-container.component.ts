import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
@Component({
  selector: 'app-template-selection-container',
  templateUrl: './template-selection-container.component.html',
  styleUrls: ['./template-selection-container.component.css']
})
export class TemplateSelectionContainerComponent implements OnInit {
  @Input() flexColumn:boolean;
  constructor() { }

  ngOnInit(): void {
  }

}
