import { Component } from '@angular/core';
import { Entry } from 'contentful';
import { ContentfulService } from 'src/app/services/contentful.service';

@Component({
  selector: 'app-blog-page',
  templateUrl: './blog-page.component.html',
  styleUrls: ['./blog-page.component.css']
})
export class BlogPageComponent {
  posts:Entry<any>[] = [];
  constructor(public contentfulService:ContentfulService) {}

  ngOnInit():void {
    this.contentfulService.getBlogPostsOrdered('blogPost').then(posts => this.posts = posts);
  }

  getFormattedDate(date:string):string {
    let final:string = "";
    // AM
    if(date.includes("T0")) {final += date.substring(0, date.indexOf("T0")) + " " + date.substring(date.indexOf("T0")+2) + "AM";}
    // PM
    else if(date.includes("T1")) {final += date.substring(0, date.indexOf("T1")) + " " + date.substring(date.indexOf("T1")+2) + "PM";}
    return final;
  }

}
