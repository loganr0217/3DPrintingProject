import { Component, OnInit } from '@angular/core';
import { Entry } from 'contentful';
import { ContentfulService } from 'src/app/services/contentful.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-faq-page',
  templateUrl: './faq-page.component.html',
  styleUrls: ['./faq-page.component.css']
})
export class FaqPageComponent implements OnInit {
  posts:Entry<any>[] = [];
  constructor(public contentfulService:ContentfulService, private sanitizer:DomSanitizer) { }

  ngOnInit(): void {
    this.contentfulService.getPosts('faq').then(posts => this.posts = posts);
  }

  fixMailLink(s:string) {
    return this.sanitizer.bypassSecurityTrustHtml(s.replace("https://info@lightscreen.art", "mailto: info@lightscreen.art"));
  }

}
