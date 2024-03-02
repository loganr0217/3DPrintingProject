import { Component, Input, OnInit } from '@angular/core';
import { ContentfulService } from 'src/app/services/contentful.service';
import { Entry } from 'contentful';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { Form, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  @Input() marketingPage:boolean;

  posts:Entry<any>[] = [];
  fadeawayImages:Entry<any>[] = [];
  emailForm!:UntypedFormGroup;

  constructor(public contentfulService:ContentfulService, public sharedDataService:SharedDataService, 
    private http:HttpClient, private formBuilder:UntypedFormBuilder) { }

  // Convenience getters for easy access to form fields
  get email() {return this.emailForm.get('email');}

  ngOnInit(): void {
    // Getting contact form set up
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.contentfulService.getPosts('landingPage').then(posts => this.posts = posts);
    this.contentfulService.getPosts('fadeawayImage').then(posts => this.fadeawayImages = posts);
  }

  // Email form submission
  submitEmailForm(signupLocation:string):void {
    const headers = { 'content-type': 'application/json'}  
    const body=JSON.stringify(
      {
        'email':this.email?.value,
        'location':signupLocation
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
              this.nextstage2();
            }
            else if(this.sharedDataService.userInfo.length == 1 && this.sharedDataService.userInfo[0] == -1) {alert("A user with that email already exists.");}
          });;
          this.emailForm.reset();
        }
    }
    else {alert("Make sure to enter information in each field");}
  }

  // Focus email signup
  focusEmailRegister():void {
    if(this.sharedDataService.signedIn) {this.nextstage2();}
    else {
      document.getElementById("requiredEmailField")?.focus();
      document.getElementById("requiredEmailField")?.blur();
      document.getElementById("requiredEmailField")?.focus();
    }
    
  }


  // Starts design process
  nextstage2() {
    this.sharedDataService.shoppingSectionActive = false;
    this.sharedDataService.oldDesignProcessActive = true;
    document.getElementById("shoppingPage")?.setAttribute("style", "visibility:hidden; display:none;");
    document.getElementById("oldDesignProcess")?.setAttribute("style", "visibility:visible;");
    document.getElementById("stage2")?.setAttribute("style", "visibility:visible;");
    document.getElementById("stage2")?.scrollIntoView({behavior: 'smooth'});
    if(this.sharedDataService.signedIn) {this.sharedDataService.currentStepID = 1;}
    else {this.sharedDataService.currentStepID = 0;}
    const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : 'undefined';
    this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/updatesession?sessionID="+this.sharedDataService.sessionID+"&lastStepID="+this.sharedDataService.currentStepID+"&startingURL='"+this.sharedDataService.sessionStartingUrl+"'&userEmail='"+email+"'").subscribe(result => { 
      });
  }

  // Starts shopping process and wipes design process
  enterShoppingPage() {
    this.sharedDataService.shoppingSectionActive = true;
    this.sharedDataService.oldDesignProcessActive = false;
    document.getElementById("oldDesignProcess")?.setAttribute("style", "visibility:hidden; display:none;");
    document.getElementById("shoppingPage")?.setAttribute("style", "visibility:visible;");
    document.getElementById("shoppingPage")?.scrollIntoView({behavior: 'smooth'});
  }

}
