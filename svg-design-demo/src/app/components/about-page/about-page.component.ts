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
    this.contentfulService.getPostById('2LSDhxjmKCwyvIfzne12u9', 'howTo').then(post => this.posts[0] = post);
    this.contentfulService.getPostById('4ARLsx1buVa21eJfdJgm3T', 'howTo').then(post => this.posts[1] = post);
    this.contentfulService.getPostById('3LQEq4lCz3txf8cvbf7pYM', 'howTo').then(post => this.posts[2] = post);
    this.contentfulService.getPostById('2KERXKUaE2ZFfLQ82ciWxA', 'howTo').then(post => this.posts[3] = post);
    this.contentfulService.getPostById('59SeNkOJ9iQ3KlfMaRb0WA', 'howTo').then(post => this.posts[4] = post);
    this.contentfulService.getPostById('37OYCg9VJiW4ZHoxjqVHiZ', 'howTo').then(post => this.posts[5] = post);
    this.contentfulService.getPostById('43QiNN0eAUDDakHAS3h9ix', 'howTo').then(post => this.posts[6] = post);
    // this.contentfulService.getPosts('overview').then(posts => this.posts = posts);
  }
}
