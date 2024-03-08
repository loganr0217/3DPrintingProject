import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-custom-order-page',
  templateUrl: './custom-order-page.component.html',
  styleUrls: ['./custom-order-page.component.css']
})
export class CustomOrderPageComponent {
  contactForm!: UntypedFormGroup;

  constructor(public sharedDataService:SharedDataService, private formBuilder:UntypedFormBuilder) { }

  // Convenience getters for easy access to form fields
  get email() {return this.contactForm.get('email');}
  
  ngOnInit() {
    // Getting contact form set up
    this.contactForm = this.formBuilder.group({
      name: [this.sharedDataService.userInfo.length <= 1 ? '' : this.sharedDataService.userInfo[1] + ' ' + this.sharedDataService.userInfo[2], Validators.required],
      email: [this.sharedDataService.userInfo.length <= 1 ? '' : this.sharedDataService.userInfo[3], [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }

}
