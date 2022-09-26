import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-gallery-page',
  templateUrl: './gallery-page.component.html',
  styleUrls: ['./gallery-page.component.css']
})
export class GalleryPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  range(i:number):number[] {
    return [...Array(i).keys()];
  }

  getGalleryCaption(n:number, captionNum:number):string {
    let finalCaption:string = "";
    let captions:string[] = [];
    switch(n) {
      case 0: {
        captions = "Living Room installation to reduce sun glare\nCasement transom with raised dividers\nTemplate from the Artist Inspired collection\nColors used: Purple, Frosted Lavender and Pink".split("\n");
        finalCaption = captions[captionNum];
        break;
      }
      case 1: {
        captions = "Bath installation for privacy\nCasement window with no dividers\nTemplate from the Artist Inspired Collection\nColored with Frosted Aqua, Frosted Ice Blue and Frosted Clear".split("\n");
        finalCaption = captions[captionNum];
        break;
      }
      case 2: {
        captions = "Conference Room installation for sun glare\nCasement window with no dividers\nTemplate from the Artist Inspired Collection\nColored with Frosted Ice Blue, Frosted Blue, Frosted Yellow and Frosted Clear".split("\n");
        finalCaption = captions[captionNum];
        break;
      }
      case 3: {
        captions = "Bath installation for privacy\nCasement window with no dividers\nTemplate from the Artist Inspired collection\nColored with Red, Green, Blue and White".split("\n");
        finalCaption = captions[captionNum];
        break;
      }
      case 4: {
        captions = "Living Room installation for privacy\nDoor window with raised dividers\nTemplate from the Artist Inspired collection\nColored with Blue, Yellow and Gray".split("\n");
        finalCaption = captions[captionNum];
        break;
      }
      default: {
        finalCaption = "";
        break;
      }
    }

    return finalCaption;
  } 

  goToPhoto(n:number) {
    document.getElementById("galleryPhoto"+(n+1))?.scrollIntoView({behavior: 'smooth'});
  }
}
