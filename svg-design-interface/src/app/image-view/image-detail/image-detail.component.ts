import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ImageObj } from '../ImageObj';
import { PopupComponent } from '../popup-model/popup.component';

@Component({
  selector: 'app-image-detail',
  templateUrl: './image-detail.component.html',
  styleUrls: ['./image-detail.component.css']
})
export class ImageDetailComponent implements OnInit {
  lessons!: ImageObj[];
  constructor( private modalService: NgbModal){ }

  ngOnInit(): void {//create image
    this.lessons = [{ image_name: 'image_name', image_path: '/assets/img/1.5Sframe.svg' },
    { image_name: 'image_name', image_path: '/assets/img/1_7Aframe03.svg' },
    { image_name: 'image_name', image_path: '/assets/img/1_7Aframe05.svg' },
    { image_name: 'image_name', image_path: '/assets/img/1.5Aframe.svg' }];
    //disable close popup
    let ngbModalOptions: NgbModalOptions = {
      backdrop : 'static',
      keyboard : false
    };
    console.log(ngbModalOptions);
    const modalRef = this.modalService.open(PopupComponent,ngbModalOptions);
    modalRef.componentInstance.lessons = this.lessons;
    modalRef.result.then((result) => {
      if (result) {
        console.log(result);
      }
    }).catch(e => {
      console.log(e);
    });
  }

}
