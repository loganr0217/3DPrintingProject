import { Component } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-template-filter-shopping',
  templateUrl: './template-filter-shopping.component.html',
  styleUrls: ['./template-filter-shopping.component.css']
})
export class TemplateFilterShoppingComponent {
  stage2Visible:boolean = false;
  stage3Visible:boolean = false;
  templateSectionVisible:boolean = false;
  selectedPalleteID:number = -1;
  selectedPalleteColors:string = '';

  constructor(public sharedDataService:SharedDataService) { }

  changeStage2Visibility():void {this.stage2Visible = !this.stage2Visible;}
  changeStage3Visibility():void {this.stage3Visible = !this.stage3Visible;}
  changeTemplateSectionVisibility():void {this.templateSectionVisible = !this.templateSectionVisible;}

  updateSelectedPalleteCategory(palleteCategory:string):void {this.sharedDataService.selectedPalleteCategory = palleteCategory;}
  updateSelectedPallete(palleteID:number):void {this.selectedPalleteID = palleteID; this.sharedDataService.selectedPalleteID = palleteID;}

  updateSelectedTemplateCategories():void {
    let templateCategories:string = "";
    for(const tempCategory of ["Artist Inspired", "Interests", "Garden", "Classics", "Sacred", "Abstract"]) {
      if((<HTMLInputElement>document.getElementById("check_"+tempCategory))?.checked) {
        templateCategories += tempCategory + ";";
      }
    }
    this.sharedDataService.selectedTemplateCategory = templateCategories;
  }

  updatePalleteCategories():void {
    let palleteCategories:string = "";
    for(const palleteCategory of ['Pasteles', 'Natural', 'Moody', 'Monochrome', 'Vivid', 'Seasonal']) {
      if((<HTMLInputElement>document.getElementById("check_"+palleteCategory))?.checked) {
        palleteCategories += palleteCategory + ";";
      }
    }
    this.sharedDataService.selectedPalleteCategory = palleteCategories;
  }

  getPalleteColorD(colors:string, colorIndex:number):string {
    let separatedColors:string[] = colors.split(",");
    let splitNumber:number = 300 / separatedColors.length;
    let paneString:string = "M " + colorIndex*splitNumber + ", 0 V 300 H " + (colorIndex+1)*splitNumber + "V 0 Z";
    return paneString;
  }

  updateCurrentColors(directionRight:boolean) {
    let currentColors:string[] = this.selectedPalleteColors.split(",");

    // Rotating colors in accordance with arrow clicked
    if(directionRight) {currentColors.unshift(currentColors.pop()!);}
    else {currentColors.push(currentColors.shift()!);}

    this.selectedPalleteColors = currentColors.join(",");
    this.sharedDataService.selectedPalleteColors = currentColors;
  }

  updatePalleteColors(palleteColors:string):void {
    this.selectedPalleteColors = palleteColors;
    this.sharedDataService.selectedPalleteColors = palleteColors.split(',');
  }

}
