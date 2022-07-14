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
  constructor(public sharedDataService:SharedDataService) { }

  userSignout():void {
    if (confirm('Are you sure you want to logout of your account?')) {
      this.sharedDataService.userInfo = [];
      this.sharedDataService.signedIn = false;
    }
  }
}
