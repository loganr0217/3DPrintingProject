import { HttpClient } from '@angular/common/http';
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

  constructor(public sharedDataService:SharedDataService, private formBuilder:UntypedFormBuilder, private http:HttpClient) { }

  // Convenience getters for easy access to form fields
  get name() {return this.contactForm.get('name');}
  get email() {return this.contactForm.get('email');}
  get message() {return this.contactForm.get('message');}
  
  ngOnInit() {
    // Getting contact form set up
    this.contactForm = this.formBuilder.group({
      name: [this.sharedDataService.userInfo.length <= 1 ? '' : this.sharedDataService.userInfo[1] + ' ' + this.sharedDataService.userInfo[2], Validators.required],
      email: [this.sharedDataService.userInfo.length <= 1 ? '' : this.sharedDataService.userInfo[3], [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
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
        let fullMessage:String = "Name: " + (this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[1]+" "+this.sharedDataService.userInfo[2] : this.name?.value) + "\nEmail: " + (this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : this.email?.value) + "\nOrder Details: " + this.message?.value;
      
        if (confirm("Are you sure you want to send this order request?\n" + fullMessage)) {
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

  getEmailLink():void {
    const name:string = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[1]+" "+this.sharedDataService.userInfo[2] : this.name?.value;
    const email:string = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : this.email?.value;
    const message:string = name + " Custom Order Details:%0D%0A" + this.message?.value + "%0D%0A%0D%0AAttach any images below:%0D%0A";

    window.location.href="mailto:info@lightscreenart.com?subject=" + name + " Custom Order&body="+message;
  }

}
