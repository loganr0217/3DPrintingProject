import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stage1',
  templateUrl: './stage1.component.html',
  styleUrls: ['./stage1.component.css']
})
export class Stage1Component implements OnInit {
  constructor(private router: Router) { }

  ngOnInit(): void {
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


  goToPage(){
    this.router.navigate([`/gallery`]);
  }
}
