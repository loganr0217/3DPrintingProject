import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { Entry } from 'contentful';
import { ContentfulService } from 'src/app/services/contentful.service';

@Component({
  selector: 'app-template-category-stage',
  templateUrl: './template-category-stage.component.html',
  styleUrls: ['./template-category-stage.component.css']
})
export class TemplateCategoryStageComponent implements OnInit {
  posts:Entry<any>[] = [];
  howToPosts:Entry<any>[] = [];
  constructor(public sharedDataService:SharedDataService, public contentfulService:ContentfulService) { }

  ngOnInit(): void {
    this.contentfulService.getPosts('stage4').then(posts => this.posts = posts);
    this.contentfulService.getPostById('2KERXKUaE2ZFfLQ82ciWxA', 'howTo').then(post => this.howToPosts.push(post));
  }

  showTemplates(tempCategory:string):void {
    this.sharedDataService.templatesAvailable = false;
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
    else if(fileType == "Sacred") {return "assets/img/templateCategoryButtons/sacred.svg";}
    else {return "";}
  }
}
