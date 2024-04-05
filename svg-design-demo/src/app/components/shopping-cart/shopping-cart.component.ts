import { Component } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { SVGTemplate } from '../svgScaler';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css']
})
export class ShoppingCartComponent {

  constructor(public sharedDataService:SharedDataService, private http:HttpClient) { }

  range(i:number):number[] {
    return [...Array(i).keys()];
  }

  // Gets template viewbox
  getTemplateViewBox(d:string, scaleX:number=1, scaleY:number=1):string {
    let myTemplate:SVGTemplate = new SVGTemplate(d);
    let tempViewBox:string = (scaleX * myTemplate.xMin) + " " + (scaleY * myTemplate.yMin) + " " + (scaleX * myTemplate.width) + " " + (scaleY * myTemplate.height);
    return tempViewBox;
  }

  convertNumber(num:number, unit:string):number {
    if(unit == "mm") {return num;}
    else if(unit == "inches") {return num*25.4;}
    else {return num*10;};
  }
  

  makeOrderMultiple():void {
    if(confirm("Are you sure you want to checkout with these items in your cart?")) {
      // Setting up vars to get final info for order
      const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : null;
      const password:string = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[4] : "";
      let selectedDividerType:string[] = [];
      let unitChoice:string[] = [];
      let windowWidth:number[] = [];
      let windowHeight:number[] = [];
      let horzDividers:number[] = [];
      let vertDividers:number[] = [];
      let dividerWidth:number[] = [];
      let templateID:number[] = [];
      let panelColoringString:string[] = [];
      let bottomWindowWidth:number[] = [];
      let bottomWindowHeight:number[] = [];
      let frameColor:string[] = [];
      let totalArea:number[] = [];

      // Going through the current list of orders
      for(let i:number = 0; i < this.sharedDataService.shoppingCart.length; ++i) {
        let currentItem:any = this.sharedDataService.shoppingCart[i];
        selectedDividerType.push(currentItem[2]);
        unitChoice.push(currentItem[3]);
        windowWidth.push(currentItem[4]);
        windowHeight.push(currentItem[5]);
        horzDividers.push(currentItem[6]);
        vertDividers.push(currentItem[7]);
        dividerWidth.push(currentItem[8]);
        templateID.push(currentItem[9]);
        panelColoringString.push(currentItem[10]);
        bottomWindowWidth.push(currentItem[16]);
        bottomWindowHeight.push(currentItem[17]);
        frameColor.push(currentItem[22]);
        totalArea.push( this.convertNumber( this.convertNumber( (currentItem[4]*currentItem[5])+(currentItem[16]*currentItem[17]), currentItem[3]) , currentItem[3])  );
      }

      const headers = { 'content-type': 'application/json'}  
      const body=JSON.stringify(
        {
          'email':email,
          'windowWidth':windowWidth,
          'windowHeight':windowHeight,
          'unitChoice':unitChoice,
          'horzDividers':horzDividers,
          'vertDividers':vertDividers,
          'dividerWidth':dividerWidth,
          'bottomWindowWidth':bottomWindowWidth,
          'bottomWindowHeight':bottomWindowHeight,
          'panelColoringString':panelColoringString,
          'templateID':templateID,
          'frameColor':frameColor,
          'couponCode':'stripe',
          'totalArea':totalArea
        });

      // const streetAddress:string = (<HTMLInputElement>document.getElementById("streetAddressInput")).value;
      // const city:string = (<HTMLInputElement>document.getElementById("cityInput")).value;
      // const state:string = (<HTMLInputElement>document.getElementById("stateInput")).value;
      // const zipcode:string = (<HTMLInputElement>document.getElementById("zipcodeInput")).value;
      // const country:string = "US";
      // const bottomWindowWidth:number = this.isDoubleHung() ? this.convertBackNumber(this.sharedDataService.bottomSashWidth, this.sharedDataService.unitChoice) : 0;
      // const bottomWindowHeight:number = this.isDoubleHung() ? this.convertBackNumber(this.sharedDataService.bottomSashHeight, this.sharedDataService.unitChoice) : 0;
      // const frameColor:string = this.sharedDataService.currentFilamentColor;

      // this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/saveorder?email='"+email
      // +"'&password='"+password+"'&selectedDividerType='"+selectedDividerType+"'&unitChoice='"+unitChoice
      // +"'&windowWidth="+windowWidth+"&windowHeight="+windowHeight+"&horzDividers="+horzDividers
      // +"&vertDividers="+vertDividers+"&dividerWidth="+dividerWidth
      // +"&templateID="+templateID+"&panelColoringString='"+panelColoringString
      // +"'&bottomWindowWidth="+bottomWindowWidth+
      // "&bottomWindowHeight="+bottomWindowHeight+"&frameColor='"+frameColor+"'").subscribe(result => alert("Success! Your order has been saved."));
      
      this.http.post("https://backend-dot-lightscreendotart.uk.r.appspot.com/makeordermultiple?numOrders="+this.sharedDataService.shoppingCart.length, body, {'headers':headers}).subscribe(result => alert("Success! Your order has been saved."));
    }
  }

  // Gets panel layout for an order
  getPanelLayout(temp:{id:number, numPanels:number, panelDims:number[], tempString:string, category:string}, orderIndex:number = -1):SVGTemplate[][] {
    // Creating panel layout array
    let panelLayout:SVGTemplate[][] = [];
    for(let row:number = 0; row < temp.panelDims[1]; ++row) {panelLayout.push([]);}
    
    // Splitting the tempString info into a 2d array of panel info
    let tempString:string[] = temp.tempString.split(';');

    let panelInfoArray:string[][] = [];
    for(let index:number = 0; index < tempString.length; ++index) {
      panelInfoArray.push(tempString[index].split(','));
    }

    // Getting the panel information for the design
    // this.sharedDataService.panelLayout = [];
    this.sharedDataService.getPanelInfo(temp);

    // Adding each panel to the panel layout
    for(let panelID:number = 0; panelID < panelInfoArray.length; ++panelID) {
      let panelIndex:number = this.sharedDataService.svgTemplateData[Number(panelInfoArray[panelID][0])].findIndex(function(item, i){
        return Number(item.panelNumber) == Number(panelInfoArray[panelID][1])
      });
      
      let myTemplate:SVGTemplate = new SVGTemplate(this.sharedDataService.svgTemplateData[Number(panelInfoArray[panelID][0])][panelIndex].d);
      myTemplate.numberRotations = Number(panelInfoArray[panelID][2]);
      myTemplate.flipped = Number(panelInfoArray[panelID][3]) == 1 ? true : false;
      myTemplate.autofillString = this.sharedDataService.svgTemplateData[Number(panelInfoArray[panelID][0])][panelIndex].panelAutofillString;
      
      if(panelID < this.sharedDataService.numberTopPanels) {
        myTemplate.scaleTemplate(this.sharedDataService.topPanelWidth/300, this.sharedDataService.topPanelHeight/300);
      } 
      else {
        myTemplate.scaleTemplate(this.sharedDataService.bottomPanelWidth/300, this.sharedDataService.bottomPanelHeight/300);
      }

      panelLayout[Math.floor(panelID/temp.panelDims[0])].push(myTemplate);
    }

    // Adding userOrder panelLeftToRight if not already there
    if(orderIndex != -1 && this.sharedDataService.shoppingCart[orderIndex].length == 24) {this.sharedDataService.shoppingCart[orderIndex].push(panelLayout[0].length);}
    return panelLayout;
  }

  // Method to get style for an order pane
  getPaneStyle(row:number, col:number, paneNum:number, order:any):string {
    // if(this.isDarkMode()) {
    //   return "fill:#"+this.sharedDataService.darkPanelColoringArray[(row*this.sharedDataService.panelLayoutDims[0] + col)][paneNum];
    // }
    let panelColorStrings:string[] = order[10].split(";");
    if(order.length <= 24) {return "fill:#ff0000";}
    let i:number = row*order[24] + col;
    let tmp:string[] = panelColorStrings[i].split(",");

    return "fill:#"+tmp[paneNum];
    
  }

  // Method to find template corresponding to order
  getOrderTemplate(order:any):any {
    let tempID:number = Number(order[9]);
    // Finding template by id
    let tempIndex:number = this.sharedDataService.templateData.findIndex(function(item, i){
      return Number(item.id) == tempID
    });
    return this.sharedDataService.templateData[tempIndex];
  }

  removeItemFromCart(id:number):void {
    if(confirm("Are you sure you want to remove this order from the cart?")) {
      this.sharedDataService.shoppingCart.splice(id, 1);
      localStorage.setItem('shoppingCart', JSON.stringify(this.sharedDataService.shoppingCart));
    }
  }

}
