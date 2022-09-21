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
        
  }
  
}
