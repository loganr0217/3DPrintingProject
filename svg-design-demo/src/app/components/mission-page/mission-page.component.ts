import { Component, OnInit } from '@angular/core';
import { Entry } from 'contentful';
import { ContentfulService } from 'src/app/services/contentful.service';

@Component({
  selector: 'app-mission-page',
  templateUrl: './mission-page.component.html',
  styleUrls: ['./mission-page.component.css']
})
export class MissionPageComponent implements OnInit {
  posts:Entry<any>[] = [];
  constructor(public contentfulService:ContentfulService) {}
  ngOnInit(): void {
    this.contentfulService.getPostById('6PXOdHz86ReJG7v45WldxO', 'tutorial').then(post => this.posts.push(post));
  }

}
