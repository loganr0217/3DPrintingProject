import { Component, OnInit } from '@angular/core';
import { Entry } from 'contentful';
import { ContentfulService } from 'src/app/services/contentful.service';

@Component({
  selector: 'app-about-page',
  templateUrl: './about-page.component.html',
  styleUrls: ['./about-page.component.css']
})
export class AboutPageComponent implements OnInit {
  posts:Entry<any>[] = [];
  constructor(public contentfulService:ContentfulService) { }

  ngOnInit(): void {
    this.contentfulService.getPosts('overview').then(posts => this.posts = posts);
  }
}
