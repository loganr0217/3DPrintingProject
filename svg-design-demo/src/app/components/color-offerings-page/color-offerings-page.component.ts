import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-color-offerings-page',
  templateUrl: './color-offerings-page.component.html',
  styleUrls: ['./color-offerings-page.component.css']
})
export class ColorOfferingsPageComponent implements OnInit {
  selectedColor:{id:number, name:string, hex:string, paneColor:boolean, isAvailable:boolean};
  constructor(public sharedDataService:SharedDataService, private http:HttpClient) { }

  ngOnInit(): void {
  }

  selectColor(chosenColor:{id:number, name:string, hex:string, paneColor:boolean, isAvailable:boolean}):void {
    this.selectedColor = chosenColor;
  }

  addColor():void {
    const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : "";
    const password:string = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[4] : "";
    const colorName:string = (<HTMLInputElement>document.getElementById("nameInput"))?.value;
    const colorHex:string = (<HTMLInputElement>document.getElementById("hexInput"))?.value;
    const isAvailable:boolean = (<HTMLInputElement>document.getElementById("customSwitchAvailable"))?.checked;
    const colorString:string = "Name: " + colorName + ", Hex: #" + colorHex + ", Availability: " + (isAvailable ? 'available' : 'unavailable');
    //const templateString:string = this.templateString.substring(0, this.templateString.length-1);
    if(confirm('Are you sure you want to add this color?\n' + colorString)) {
      this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/addpanecolor?email='"+email+"'&password='"+password+"'&name='" + colorName + "'&hex='" + colorHex + "'&isAvailable='" + isAvailable + "'").subscribe(result => {
        let test = JSON.stringify(result).split('[').join("").split(']').join("").split('"').join("").split(",");
        alert(test);
        if(test[0] != '-1') {this.refreshColorsList();}
       });
    }
  }

  changeColorAvailability():void {
    const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : "";
    const password:string = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[4] : "";
    const colorID:number = this.selectedColor.id;
    if(confirm('Are you sure you want to change color ' + colorID + ' from ' + (this.selectedColor.isAvailable ? 'available' : 'unavailable') + ' to ' + (!this.selectedColor.isAvailable ? 'available' : 'unavailable') + ' ?')) {
      this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/changepanecoloravailability?email='"+email+"'&password='"+password+"'").subscribe(result => {
        let test = JSON.stringify(result).split('[').join("").split(']').join("").split('"').join("").split(",");
        alert(test);
        if(test[0] != '-1') {this.refreshColorsList();}
       });
    }
  }

  deleteColor():void {
    const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : "";
    const password:string = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[4] : "";
    const colorID:number = this.selectedColor.id;
    if(confirm('Are you sure you want to delete color ' + colorID + '?')) {
      this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/deletepanecolor?email='"+email+"'&password='"+password+"'&colorId=" + colorID).subscribe(result => {
        let test = JSON.stringify(result).split('[').join("").split(']').join("").split('"').join("").split(",");
        alert(test);
        if(test[0].length > 1) {this.refreshColorsList();}
       });
    }
  }

  refreshColorsList():void {
    this.sharedDataService.colorsData = []
    this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/panecolors").subscribe(result => {
      let tmp = JSON.parse(JSON.stringify(result));
      this.sharedDataService.colorsData = []
      if(tmp.length >= 1) {
        // console.log(templateData);
        for(let i:number = 0; i < tmp.length; ++i) {
          let currentTmp:{id:number, name:string, hex:string, paneColor:boolean, isAvailable:boolean} = {id:tmp[i][0], name:tmp[i][1], hex:tmp[i][2], paneColor:true, isAvailable:tmp[i][3]};
          this.sharedDataService.colorsData.push(currentTmp);
        }
      }
      else {alert("error"); this.sharedDataService.templateData = [];}
      // console.log(this.loginForm.value);
      // console.log(this.sharedDataService.userInfo);
    });
  }

}
