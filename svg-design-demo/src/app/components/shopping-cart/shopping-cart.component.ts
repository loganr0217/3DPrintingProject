import { Component } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { SVGTemplate } from '../svgScaler';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css']
})
export class ShoppingCartComponent {

  constructor(public sharedDataService:SharedDataService) { }

  range(i:number):number[] {
    return [...Array(i).keys()];
  }

  // Gets template viewbox
  getTemplateViewBox(d:string, scaleX:number=1, scaleY:number=1):string {
    let myTemplate:SVGTemplate = new SVGTemplate(d);
    let tempViewBox:string = (scaleX * myTemplate.xMin) + " " + (scaleY * myTemplate.yMin) + " " + (scaleX * myTemplate.width) + " " + (scaleY * myTemplate.height);
    return tempViewBox;
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
