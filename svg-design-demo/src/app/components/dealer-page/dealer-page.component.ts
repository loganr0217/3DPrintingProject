import { Component } from '@angular/core';
import { Entry } from 'contentful';
import { ContentfulService } from 'src/app/services/contentful.service';
@Component({
  selector: 'app-dealer-page',
  templateUrl: './dealer-page.component.html',
  styleUrls: ['./dealer-page.component.css']
})
export class DealerPageComponent {
  post:Entry<any>;

  constructor(public contentfulService:ContentfulService) { }

  ngOnInit(): void {
    // this.contentfulService.getPostById('2LSDhxjmKCwyvIfzne12u9', 'howTo').then(post => this.post = post);
    this.contentfulService.getPostById('5FU0B2btQSaxIv2OBQ9qKv', 'dealerPageContent').then(post => this.post = post);
    // this.contentfulService.getPosts('overview').then(posts => this.posts = posts);
  }
}
