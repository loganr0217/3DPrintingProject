import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css']
})
export class CheckoutPageComponent implements OnInit {

  constructor(private sharedDataService:SharedDataService) { }

  ngOnInit(): void {
  }


  getPanelWidthHeight(width:number):number {
    if(width >= 100 && width <=500) {return width;}
    else {return width / (Math.ceil(width/500));}
  }

  convertNumber(num:number, unit:string):number {
    if(unit == "mm") {return num;}
    else if(unit == "inches") {return num*25.4;}
    else {return num*10;};
  }
  
  getFinalInfo():void {
    // let finalText:string = 
    // "Divider Type: " + this.sharedDataService.selectedDividerType + "\n" + 
    // "Window Shape: " + this.sharedDataService.selectedWindowShape + "\n" +
    // "Unit of measure: " + this.sharedDataService.unitChoice + " to mm\n" +
    // "Width: " + this.convertNumber(this.sharedDataService.windowWidth, this.sharedDataService.unitChoice) + "mm\n" + 
    // "Height: " + this.convertNumber(this.sharedDataService.windowHeight, this.sharedDataService.unitChoice) + "mm\n" +
    // "Panel Width: " + this.getPanelWidthHeight(this.convertNumber(this.sharedDataService.windowWidth, this.sharedDataService.unitChoice)) + "mm\n" +
    // "Panel Height: " + + this.getPanelWidthHeight(this.convertNumber(this.sharedDataService.windowHeight, this.sharedDataService.unitChoice)) + "mm\n" +
    // "Template: " + this.sharedDataService.currentWindowNumber + "\n"
    // "Color Selection: " + "\n";

    // var serializer = new XMLSerializer();
    // var xmlString = serializer.serializeToString(document.getElementById("windowPreviewContainertrue")!);
    // let svgText:string[] = xmlString.split("<svg");
    // for(let i:number = 0; i < svgText.length; ++i) {svgText[i] = "<svg" + svgText[i]; finalText += svgText[i] + "\n\n";}
    // console.log(finalText);
    let finalText:string[] = [String(this.convertNumber(this.sharedDataService.windowWidth / this.sharedDataService.panelLayoutDims[0], this.sharedDataService.unitChoice)),
      String(this.convertNumber(this.sharedDataService.windowHeight / this.sharedDataService.panelLayoutDims[1], this.sharedDataService.unitChoice))
    ];
    let final:string = "[";
    for(let row:number = 0; row < this.sharedDataService.panelLayoutDims[1]; ++row) {
      for(let col:number = 0; col < this.sharedDataService.panelLayoutDims[0]; ++col) {
        //finalText.push(this.sharedDataService.svgTemplateData[this.sharedDataService.currentTemplateNumber][i].d);
        finalText.push(this.sharedDataService.panelLayout[row][col].getOptimizedD());
      }
    }
    for(let j:number = 0; j < finalText.length; ++j) {
      final += "'" + finalText[j] + "'";
      if(j != finalText.length-1) {final += ",";}
    }
    final += "]\n"
    final += this.sharedDataService.panelColoringArray;
    console.log(final);

  
  }

}