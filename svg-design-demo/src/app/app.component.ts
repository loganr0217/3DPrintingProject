import { Component } from '@angular/core';

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
}
