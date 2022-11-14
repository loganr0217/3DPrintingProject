import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { SharedDataService } from './services/shared-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'svg-design-demo';
  goToFooter():void {
    document.getElementById("footer")?.scrollIntoView({behavior: 'smooth'});
  }
  constructor(public sharedDataService:SharedDataService, private http:HttpClient) { }

  userSignout():void {
    if (confirm('Are you sure you want to logout of your account?')) {
      this.sharedDataService.userInfo = [];
      this.sharedDataService.signedIn = false;
      localStorage.clear();
    }
  }

  ngOnInit() {
    
        // Getting data and populating user info
        const data = JSON.parse(localStorage.getItem('userInfo') || '{}');
        this.sharedDataService.userInfo = [];
        for(let i:number = 0; i < data.length; ++i) {
          this.sharedDataService.userInfo.push(data[i]);
        }
    
        // User is not signed in
        if(this.sharedDataService.userInfo.length <= 1) {this.sharedDataService.signedIn = false;} 
        // User is signed in
        else {this.sharedDataService.signedIn = true;}
    
        // Getting panelsets from database
        this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/panels").subscribe(result => {
          let panelData = JSON.parse(JSON.stringify(result));
          
          if(panelData.length > 1) {
            // console.log(panelData);
            this.sharedDataService.svgTemplateData = [];
            for(let i:number = 0; i < 100; ++i) {this.sharedDataService.svgTemplateData.push([]);}
            for(let i:number = 0; i < panelData.length; ++i) {
              let tmp:{id:number, name:string, panelNumber:number, d:string, panelAutofillString:string} = {id:panelData[i][1], name:panelData[i][3], panelNumber:panelData[i][2], d:panelData[i][4], panelAutofillString:panelData[i][5]};
              this.sharedDataService.svgTemplateData[panelData[i][1]].push(tmp);
            }
          }
          else {alert("error"); this.sharedDataService.svgTemplateData = [];}
          while(this.sharedDataService.svgTemplateData[this.sharedDataService.svgTemplateData.length-1].length == 0) {
            this.sharedDataService.svgTemplateData.pop();
          }
          // console.log(this.loginForm.value);
          // console.log(this.sharedDataService.userInfo);
        });

        // Getting templates from database
        this.sharedDataService.templateData = []
        this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/templates?numberPanelsX=-1&numberPanelsY=-1").subscribe(result => {
          let tmp = JSON.parse(JSON.stringify(result));
          this.sharedDataService.templateData = []
          if(tmp.length >= 1) {
            // console.log(templateData);
            for(let i:number = 0; i < tmp.length; ++i) {
              let currentTmp:{id:number, numPanels:number, panelDims:number[], tempString:string, category:string} = {id:tmp[i][0], numPanels:tmp[i][1]*tmp[i][2], panelDims:[tmp[i][1], tmp[i][2]], tempString:tmp[i][3], category:tmp[i][5]};
              this.sharedDataService.templateData.push(currentTmp);
            }
          }
          else {alert("error"); this.sharedDataService.templateData = [];}
          // console.log(this.loginForm.value);
          // console.log(this.sharedDataService.userInfo);
        });


        // Getting pane colors from database
        this.sharedDataService.colorsData = []
        this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/panecolors").subscribe(result => {
          let tmp = JSON.parse(JSON.stringify(result));
          this.sharedDataService.colorsData = []
          if(tmp.length >= 1) {
            // console.log(templateData);
            for(let i:number = 0; i < tmp.length; ++i) {
              let currentTmp:{id:number, name:string, hex:string, paneColor:boolean, isAvailable:boolean, placementID:number, opacity:number} = {id:tmp[i][0], name:tmp[i][1], hex:tmp[i][2], paneColor:true, isAvailable:tmp[i][3], placementID:tmp[i][4], opacity:tmp[i][5]};
              this.sharedDataService.colorsData.push(currentTmp);
            }
          }
          else {alert("error"); this.sharedDataService.templateData = [];}
          // console.log(this.loginForm.value);
          // console.log(this.sharedDataService.userInfo);
        });
        
  }
  
}
