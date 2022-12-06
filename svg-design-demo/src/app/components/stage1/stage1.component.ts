import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ContentfulService } from 'src/app/services/contentful.service';
import { Entry } from 'contentful';
import { marked } from 'marked';

@Component({
  selector: 'app-stage1',
  templateUrl: './stage1.component.html',
  styleUrls: ['./stage1.component.css']
})
export class Stage1Component implements OnInit {
  posts:Entry<any>[] = [];

  constructor(public contentfulService:ContentfulService) {}

  ngOnInit(): void {
    this.contentfulService.getPosts('stage1').then(posts => this.posts = posts);
  }

  @ViewChild('carousel') carousel: ElementRef;

  ngAfterContentInit(): void {
    // setInterval(() => {
    //   this.carousel.nativeElement.click();
    // }, 5000)
  }

  nextstage2() {
    document.getElementById("stage2")?.setAttribute("style", "visibility:visible;")
    document.getElementById("stage2")?.scrollIntoView({behavior: 'smooth'});
    console.log(this.posts[0].fields.stage1body);
  }

  learnMore():void {
    //
  }
}
