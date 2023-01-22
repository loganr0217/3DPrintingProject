import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ContentfulService } from 'src/app/services/contentful.service';
import { Entry } from 'contentful';
import { marked } from 'marked';
import { DomSanitizer } from '@angular/platform-browser';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-stage1',
  templateUrl: './stage1.component.html',
  styleUrls: ['./stage1.component.css']
})
export class Stage1Component implements OnInit {
  posts:Entry<any>[] = [];
  howToPosts:Entry<any>[] = [];
  screenWidth:number;
  screenHeight:number;

  @HostListener('window:resize', ['$event'])
  onResize(event?:any) {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
  }

  constructor(public contentfulService:ContentfulService, private sanitizer:DomSanitizer) {this.onResize();}

  ngOnInit(): void {
    this.contentfulService.getPosts('stage1').then(posts => this.posts = posts);
    this.contentfulService.getPostById('4ARLsx1buVa21eJfdJgm3T', 'howTo').then(post => this.howToPosts.push(post));
  }

  isMobile():boolean {
    return this.screenWidth <= 576;
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
  }

  learnMore():void {
    //
  }
}
