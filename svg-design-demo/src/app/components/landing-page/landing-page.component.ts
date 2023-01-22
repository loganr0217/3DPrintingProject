import { Component, OnInit } from '@angular/core';
import { ContentfulService } from 'src/app/services/contentful.service';
import { Entry } from 'contentful';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  posts:Entry<any>[] = [];
  emailForm!:FormGroup;

  constructor(public contentfulService:ContentfulService, public sharedDataService:SharedDataService, 
    private http:HttpClient, private formBuilder:FormBuilder) { }

  // Convenience getters for easy access to form fields
  get email() {return this.emailForm.get('email');}

  ngOnInit(): void {
    // Getting contact form set up
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.contentfulService.getPosts('stage1').then(posts => this.posts = posts);
  }

  // Email form submission
  submitEmailForm():void {
    const headers = { 'content-type': 'application/json'}  
    const body=JSON.stringify(
      {
        'email':this.email?.value
      });
      
    // Making sure each field has data and it's valid
    if(this.email?.value != "" && this.email?.valid) {
        let fullMessage:string = "Is this the correct email?\n> " + this.email?.value;
      
        if (confirm(fullMessage)) {
          // this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/addpanel?email='"+email+"'&password='"+password+"'&panelSetId=" + panelSetId + "&panelNumber=" + panelNumber + "&panelName='" + panelName + "'&dAttribute='" + dAttribute + "'").subscribe(result => {
          //   let test = JSON.stringify(result).split('[').join("").split(']').join("").split('"').join("").split(",");
          //   alert(test);
          //  });
          this.http.post("https://backend-dot-lightscreendotart.uk.r.appspot.com/submitcontactform", body, {'headers':headers}).subscribe(result => {
            this.sharedDataService.userInfo = JSON.stringify(result).split('[').join("").split(']').join("").split('"').join("").split(","); 
            if(this.sharedDataService.userInfo.length > 1) {
              this.sharedDataService.signedIn = true;
              localStorage.setItem('userInfo', JSON.stringify(this.sharedDataService.userInfo));
              alert("You're now registered and should have recieved a confirmation email in your inbox.");
            }
            else if(this.sharedDataService.userInfo.length == 1 && this.sharedDataService.userInfo[0] == -1) {alert("A user with that email already exists.");}
          });;
          this.emailForm.reset();
        }
    }
    else {alert("Make sure to enter information in each field");}
  }

  // Starts design process
  nextstage2() {
    document.getElementById("stage2")?.setAttribute("style", "visibility:visible;")
    document.getElementById("stage2")?.scrollIntoView({behavior: 'smooth'});
  }

}
