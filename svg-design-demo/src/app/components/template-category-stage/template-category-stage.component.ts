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

  dividerName(id:string):string {
    if(id == "plain") {return "Category 1";}
    else if(id == "realdiv") {return "Category 2";}
    else if(id == "simdiv") {return "Category 3";}
    else {return "";}
  }

}
