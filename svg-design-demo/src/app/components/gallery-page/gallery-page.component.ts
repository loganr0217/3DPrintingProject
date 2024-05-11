import { Component, OnInit } from '@angular/core';
import { Entry } from 'contentful';
import { ContentfulService } from 'src/app/services/contentful.service';

@Component({
  selector: 'app-gallery-page',
  templateUrl: './gallery-page.component.html',
  styleUrls: ['./gallery-page.component.css']
})
export class GalleryPageComponent implements OnInit {
  posts:Entry<any>[] = [];
  getInspiredPosts:Entry<any>[] = [];
  getInspiredSortedPosts:Entry<any>[] = [];
  selectedPhotoType:string = "Featured";

  constructor(public contentfulService:ContentfulService) { }

  ngOnInit(): void {
    this.contentfulService.getPostsOrdered('galleryItem').then(posts => this.posts = posts);
    // this.contentfulService.getPosts('getInspiredImage').then(posts => this.getInspiredPosts = posts);
    // this.contentfulService.getPostById('6mu6paRGymUnFX7dDFUCjn', 'getInspiredContent').then(post => this.getInspiredPosts[0] = post);
    this.refreshImages();
  }

  range(i:number):number[] {
    return [...Array(i).keys()];
  }

  changePhotoType(photoType:string):void {
    this.selectedPhotoType = photoType;
    // console.log(this.getInspiredPosts);
    this.refreshImages();
  }

  refreshImages():void {
    this.getInspiredSortedPosts = [];
    this.contentfulService.getPostsOrdered('getInspiredImage').then(
      posts => {
        this.getInspiredPosts = posts;
        for(let post of this.getInspiredPosts) {
          if(post.fields.imageType == this.selectedPhotoType) {this.getInspiredSortedPosts.push(post);}
        }
      }
    );
    
  }

  getGalleryCaption(n:number, captionNum:number):string {
    let finalCaption:string = "";
    let captions:string[] = [];
    switch(n) {
      case 0: {
        captions = "Bath installation for privacy\nCasement window with no dividers\nTemplate from the Artist Inspired Collection\nColors used: Frosted Orange, Frosted Gold and Frosted Yellow".split("\n");
        finalCaption = captions[captionNum];
        break;
      }
      case 1: {
        captions = "Living Room installation to reduce sun glare\nCasement transom with raised dividers\nTemplate from the Artist Inspired collection\nColors used: Purple, Frosted Lavender and Pink".split("\n");
        finalCaption = captions[captionNum];
        break;
      }
      case 2: {
        captions = "Bath installation for privacy\nCasement window with no dividers\nTemplate from the Artist Inspired Collection\nColored with Frosted Aqua, Frosted Ice Blue and Frosted Clear".split("\n");
        finalCaption = captions[captionNum];
        break;
      }
      case 3: {
        captions = "Conference Room installation for sun glare\nCasement window with no dividers\nTemplate from the Artist Inspired Collection\nColored with Frosted Ice Blue, Frosted Blue, Frosted Yellow and Frosted Clear".split("\n");
        finalCaption = captions[captionNum];
        break;
      }
      case 4: {
        captions = "Bath installation, exterior view\nCasement window with no dividers\nTemplate from the Artist Inspired Collection\nColors used: Frosted Orange, Frosted Gold and Frosted Yellow".split("\n");
        finalCaption = captions[captionNum];
        break;
      }
      case 5: {
        captions = "Bath installation for privacy\nCasement window with no dividers\nTemplate from the Artist Inspired collection\nColored with Red, Green, Blue and White".split("\n");
        finalCaption = captions[captionNum];
        break;
      }
      case 6: {
        captions = "Bedroom installation for privacy\nDouble hung window with embedded dividers\nTemplate from the artist inspired collection\nColored with Frosted pink, Frosted lavender, and Frosted blue".split("\n");
        finalCaption = captions[captionNum];
        break;
      }
      case 7: {
        captions = "Living Room installation for privacy\nDoor window with raised dividers\nTemplate from the Artist Inspired collection\nColored with Blue, Yellow and Gray".split("\n");
        finalCaption = captions[captionNum];
        break;
      }
      case 8: {
        captions = "Bathroom installation for privacy\nDouble hung window with embedded dividers\nTemplate from the artist inspired collection\nColored with Frosted clear, Ivory, and Green".split("\n");
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
