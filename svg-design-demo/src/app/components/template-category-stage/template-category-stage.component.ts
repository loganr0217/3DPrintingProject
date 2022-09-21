import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-template-category-stage',
  templateUrl: './template-category-stage.component.html',
  styleUrls: ['./template-category-stage.component.css']
})
export class TemplateCategoryStageComponent implements OnInit {

  constructor(private sharedDataService:SharedDataService) { }

  ngOnInit(): void {
  }

  showTemplates(tempCategory:string):void {
    this.sharedDataService.selectedTemplateCategory = tempCategory;
    document.getElementById("templateSelectionContainer")?.setAttribute("style", "visibility:visible;");
  }

  previousStage() {
    document.getElementById("stage3")?.scrollIntoView({behavior: 'smooth'});
  }

  getTemplateCategoryButtonFile(fileType:string) {
    if(fileType == "Artist Inspired") {return "assets/img/templateCategoryButtons/artistInspired.svg";}
    else if(fileType == "Garden") {return "assets/img/templateCategoryButtons/garden.svg";}
    else if(fileType == "Interests") {return "assets/img/templateCategoryButtons/interests.svg";}
    else if(fileType == "Classics") {return "assets/img/templateCategoryButtons/classics.svg";}
    else {return "";}
  }
}
