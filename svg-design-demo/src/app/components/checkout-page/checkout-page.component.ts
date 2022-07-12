import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css']
})
export class CheckoutPageComponent implements OnInit {

  constructor(private sharedDataService:SharedDataService, private http:HttpClient) { }

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
    
    // Setting up vars to get final info for order
    const email:string = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : null;
    const selectedDividerType:string = this.sharedDataService.selectedDividerType;
    const unitChoice:string = this.sharedDataService.unitChoice;
    const windowWidth:number = this.sharedDataService.windowWidth;
    const windowHeight:number = this.sharedDataService.windowHeight;
    const horzDividers:number = this.sharedDataService.dividerNumbers[0];
    const vertDividers:number = this.sharedDataService.dividerNumbers[1];
    const dividerWidth:number = this.sharedDataService.dividerWidth;
    const templateID:number = this.sharedDataService.selectedTemplateID;
    let panelColoringString:string = "";
    for(let i:number = 0; i < this.sharedDataService.panelColoringArray.length; ++i) {
      panelColoringString += this.sharedDataService.panelColoringArray[i].join(",");
      if(i != this.sharedDataService.panelColoringArray.length - 1) {panelColoringString += ";";}
    }
    console.log(panelColoringString);
    const streetAddress:string = "test drive";
    const city:string = "test city";
    const state:string = "test state";
    const zipcode:string = "test zipcode";
    const country:string = "test country";

    this.http.get("http://34.162.208.24:5000/makeorder?email="+email
    +"&selectedDividerType='"+selectedDividerType+"'&unitChoice="+unitChoice
    +"&windowWidth="+windowWidth+"&windowHeight="+windowHeight+"&horzDividers="+horzDividers
    +"&vertDividers="+vertDividers+"&dividerWidth="+dividerWidth
    +"&templateID="+templateID+"&panelColoringString="+panelColoringString
    +"&streetAddress="+streetAddress+"&city="+city+"&state="+state
    +"&zipcode="+zipcode+"&country="+country).subscribe(result => this.sharedDataService.userInfo = result);

    alert("Success! Your order has been placed.");
  }

}