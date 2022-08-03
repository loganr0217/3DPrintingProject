import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-template-category-stage',
  templateUrl: './template-category-stage.component.html',
  styleUrls: ['./template-category-stage.component.css']
})
export class TemplateCategoryStageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  showTemplates():void {document.getElementById("templateSelectionContainer")?.setAttribute("style", "visibility:visible;");}

  previousStage() {
    document.getElementById("stage3")?.scrollIntoView({behavior: 'smooth'});
  }
}
