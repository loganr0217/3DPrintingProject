import { Component, OnInit } from '@angular/core';
import { Entry } from 'contentful';
import { ContentfulService } from 'src/app/services/contentful.service';
import { Input } from '@angular/core';

declare var $:any;

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit {
  @Input() startNumber:number;

  
  carouselPosts:Entry<any>[] = [];
  constructor(public contentfulService:ContentfulService) { }

  ngOnInit(): void {
    this.contentfulService.getPostsOrdered('carouselItem').then(posts => this.carouselPosts = posts);
  }

  prevSlide():void {
    $('#carouselExampleControls').carousel('prev');
    $('#carouselLeftExampleControls').carousel('prev');
    $('#carouselRightExampleControls').carousel('prev');
  }

  nextSlide():void {
    $('#carouselExampleControls').carousel('next');
    $('#carouselLeftExampleControls').carousel('next');
    $('#carouselRightExampleControls').carousel('next');
  }
  
  

}
