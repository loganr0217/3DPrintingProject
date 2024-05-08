import { Component, OnInit } from '@angular/core';
import { Entry } from 'contentful';
import { DomSanitizer } from '@angular/platform-browser';
import { ContentfulService } from 'src/app/services/contentful.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tutorials-page',
  templateUrl: './tutorials-page.component.html',
  styleUrls: ['./tutorials-page.component.css']
})
export class TutorialsPageComponent implements OnInit {
  posts:Entry<any>[] = [];
  installPosts:Entry<any>[] = [];
  selectedSection:string;
  constructor(public contentfulService:ContentfulService, private sanitizer:DomSanitizer, private router:Router) { }

  ngOnInit(): void {
    // Adding tutorials in this order
    this.contentfulService.getPostById('1LXCKPKRq185RVYYsRmVHp', 'tutorial').then(post => this.posts[0] = post);
    this.contentfulService.getPostById('3Ex7TXWpOtcuBsRJSTftkV', 'tutorial').then(post => this.posts[1] = post);
    this.contentfulService.getPostById('5rurIWPbWdbU7oNtqh2yNr', 'tutorial').then(post => this.posts[2] = post);
    this.contentfulService.getPostsOrdered('installTutorialItem').then(posts => this.installPosts = posts);

  }

  isActiveSection(section:string):boolean {
    return window.location.href.includes(section);
  }

  changeTutorialSection(section:string):void {
    this.selectedSection = section;
    this.router.navigate(["/tutorials"], {queryParams:{activeSection:section}})
  }

  fixNewPageLink(s:string) {
    return this.sanitizer.bypassSecurityTrustHtml(s.replace("<a", "<a target='_blank' "));
  }

  fixMailLink(s:string) {
    return this.sanitizer.bypassSecurityTrustHtml(s.replace("https://info@lightscreen.art", "mailto: info@lightscreen.art"));
  }

  goTdiInfo():void {
    document.getElementById("tdiInfo")?.scrollIntoView({behavior: 'smooth'});
    console.log(this.posts);
  }

  goMeasurementInfo():void {
    document.getElementById("measurementInfo")?.scrollIntoView({behavior: 'smooth'});
  }

  goInstallationInfo():void {
    document.getElementById("installationInfo")?.scrollIntoView({behavior: 'smooth'});
  }

}
