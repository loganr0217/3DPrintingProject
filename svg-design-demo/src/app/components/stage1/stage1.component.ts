import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ContentfulService } from 'src/app/services/contentful.service';
import { Entry } from 'contentful';
import { marked } from 'marked';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stage1',
  templateUrl: './stage1.component.html',
  styleUrls: ['./stage1.component.css']
})
export class Stage1Component implements OnInit {
  posts:Entry<any>[] = [];
  carouselPosts:Entry<any>[] = [];
  isMobile: boolean = false;

  constructor(public contentfulService:ContentfulService, private router: Router) {}

  ngOnInit(): void {
    this.contentfulService.getPosts('stage1').then(posts => this.posts = posts);
    this.contentfulService.getPosts('carouselItem').then(posts => this.carouselPosts = posts);
    let w = document.documentElement.clientWidth;
    let h = document.documentElement.clientHeight;
    if (w <= 576) {
      this.isMobile = true;
    }
    onresize = (event) => {
      w = document.documentElement.clientWidth;
      h = document.documentElement.clientHeight;
      if (w <= 576) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    };
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

  goToPage(){
    this.router.navigate([`/gallery`]);
  }
}
