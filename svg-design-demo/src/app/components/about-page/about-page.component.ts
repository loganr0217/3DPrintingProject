import { Component, OnInit } from '@angular/core';
import { Entry } from 'contentful';
import { ContentfulService } from 'src/app/services/contentful.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-about-page',
  templateUrl: './about-page.component.html',
  styleUrls: ['./about-page.component.css']
})
export class AboutPageComponent implements OnInit {
  posts:Entry<any>[] = [];
  companyPosts:Entry<any>[] = [];
  selectedSection:string = "Lightscreens";
  contactForm!: UntypedFormGroup;

  constructor(public contentfulService:ContentfulService, private formBuilder:UntypedFormBuilder, private sharedDataService:SharedDataService,
    private http:HttpClient) { }

  ngOnInit(): void {
    // this.contentfulService.getPostById('2LSDhxjmKCwyvIfzne12u9', 'howTo').then(post => this.posts[0] = post);
    // this.contentfulService.getPostById('4ARLsx1buVa21eJfdJgm3T', 'howTo').then(post => this.posts[1] = post);
    // this.contentfulService.getPostById('3LQEq4lCz3txf8cvbf7pYM', 'howTo').then(post => this.posts[2] = post);
    // this.contentfulService.getPostById('2KERXKUaE2ZFfLQ82ciWxA', 'howTo').then(post => this.posts[3] = post);
    // this.contentfulService.getPostById('59SeNkOJ9iQ3KlfMaRb0WA', 'howTo').then(post => this.posts[4] = post);
    // this.contentfulService.getPostById('37OYCg9VJiW4ZHoxjqVHiZ', 'howTo').then(post => this.posts[5] = post);
    // this.contentfulService.getPostById('43QiNN0eAUDDakHAS3h9ix', 'howTo').then(post => this.posts[6] = post);
    this.contentfulService.getPostsOrdered('exploreLightscreensItem').then(posts => this.posts = posts);
    this.contentfulService.getPosts('overview').then(posts => this.companyPosts = posts);

    this.contactForm = this.formBuilder.group({
      name: [this.sharedDataService.userInfo.length <= 1 ? '' : this.sharedDataService.userInfo[1] + ' ' + this.sharedDataService.userInfo[2], Validators.required],
      email: [this.sharedDataService.userInfo.length <= 1 ? '' : this.sharedDataService.userInfo[3], [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
    // this.contentfulService.getPosts('overview').then(posts => this.posts = posts);
  }

  // Contact form submission
  submitContactForm():void {
    const headers = { 'content-type': 'application/json'}  
    const body=JSON.stringify(
      {
        'name':this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[1]+" "+this.sharedDataService.userInfo[2] : this.name?.value,
        'email':this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : this.email?.value,
        'message':this.message?.value,
        'location':'ContactForm'
      });
      
    // Making sure each field has data and it's valid
    if((this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : this.email?.value) != ""
        && (this.sharedDataService.userInfo.length > 1 || this.email?.valid)) {
        let fullMessage:String = "Name: " + (this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[1]+" "+this.sharedDataService.userInfo[2] : this.name?.value) + "\nEmail: " + (this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : this.email?.value) + "\nMessage: " + this.message?.value;
      
        if (confirm("Are you sure you want to send this message?\n" + fullMessage)) {
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
          });

          // Signed in
          if(this.sharedDataService.userInfo.length > 1) {alert("Message sent.");}
          else {alert("Message sent. A confirmation email has been sent to your inbox.")}
          this.contactForm.reset();
        }
    }
    else {alert("Make sure to enter information in each field");}
    
    

  }

  // Convenience getters for easy access to form fields
  get name() {return this.contactForm.get('name');}
  get email() {return this.contactForm.get('email');}
  get message() {return this.contactForm.get('message');}

  changeAboutSection(section:string) {this.selectedSection = section;}
}
