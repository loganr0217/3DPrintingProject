import { Component, OnInit } from '@angular/core';
import { share } from 'rxjs';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { Polygon } from '../svgScaler';
import { SVGTemplate } from '../svgScaler';

@Component({
  selector: 'app-dimensions-form',
  templateUrl: './dimensions-form.component.html',
  styleUrls: ['./dimensions-form.component.css']
})
export class DimensionsFormComponent implements OnInit {

  constructor(private sharedDataService:SharedDataService) { }

  ngOnInit(): void {
  }

  // Method to update dimensions
  updateDimensions():void {
    // Getting the user's desired width and height
    let newWidth:number = Number((<HTMLInputElement>document.getElementById("widthInput")).value);
    let newHeight:number = Number((<HTMLInputElement>document.getElementById("heightInput")).value);
    
    let xScale:number = newWidth / this.sharedDataService.currentSvgTemplate.width;
    let yScale:number = newHeight / this.sharedDataService.currentSvgTemplate.height;

    // Returns [newD, newXScale, newYScale]
    let newTemplateInfo:string[] = this.sharedDataService.currentSvgTemplate.getScaledD(xScale, yScale);
    let newTemplate:SVGTemplate = new SVGTemplate(newTemplateInfo[0]);

    // Updating template dimensions
    document.getElementById("svgTemplate")?.setAttribute("d", newTemplate.getOptimizedD());
    document.getElementById("svgTemplate")?.setAttribute("transform", "scale("+newTemplateInfo[1]+","+newTemplateInfo[2]+")");
    let viewboxValue:string = ""+(newTemplate.xMin*Number(newTemplateInfo[1]))+" "+(newTemplate.yMin*Number(newTemplateInfo[2]))+" "+(newTemplate.width*Number(newTemplateInfo[1]))+" "+(newTemplate.height*Number(newTemplateInfo[2]));
    document.getElementById("currentTemplate")?.setAttribute("viewBox", viewboxValue);

    let paneNum:number = 0;
    for(let i:number = 0; i < newTemplate.subShapes.length; ++i) {
      if(i == newTemplate.outerEdgeIndex) {continue;}
      // Updating each individual pane
      document.getElementById("pane"+paneNum)?.setAttribute("d", newTemplate.subShapes[i].getScalablePath());
      document.getElementById("pane"+paneNum)?.setAttribute("transform", "scale("+newTemplateInfo[1]+","+newTemplateInfo[2]+")");
      ++paneNum;
    }
  }

}
