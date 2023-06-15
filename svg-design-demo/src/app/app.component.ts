import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { SVGTemplate } from './components/svgScaler';
import { SharedDataService } from './services/shared-data.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { Router } from '@angular/router';

declare var $:any;
var pageScroll:number = 0;
var stickyNav:boolean = true;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'svg-design-demo';
  contactForm!: UntypedFormGroup;
  emailFormModal!:UntypedFormGroup;
  modalPopups:number = 0;
  modalPopupIntervalId:any;
  user:SocialUser;
  loggedIn:boolean;
  

  goToFooter():void {
    document.getElementById("footer")?.scrollIntoView({behavior: 'smooth'});
  }
  constructor(public sharedDataService:SharedDataService, private http:HttpClient, private formBuilder:UntypedFormBuilder, 
    private authService:SocialAuthService, private router:Router) { }

  userSignout():void {
    if (confirm('Are you sure you want to logout of your account?')) {
      this.sharedDataService.userInfo = [];
      this.sharedDataService.signedIn = false;
      this.authService.signOut();
      localStorage.clear();
    }
  }

  // Gets current year for copyright
  getCurrentYear():string {
    let year:Date = new Date();
    return String(year.getFullYear());
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
          this.emailFormModal.reset();
        }
    }
    else {alert("Make sure to enter information in each field");}
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
  get emailModal() {return this.emailFormModal.get('email');}

  // Convenience getters for easy access to form fields
  get email() {return this.contactForm.get('email');}
  get name() {return this.contactForm.get('name');}
  get number() {return this.contactForm.get('number');}
  get message() {return this.contactForm.get('message');}

  ngOnInit() {
    // Sets up popping modal for 40 seconds of not signing in
    // this.modalPopups = window.innerWidth < 576 ? 0 : 0;
    // this.modalPopupIntervalId = setInterval(() => {
    //   if(this.sharedDataService.signedIn || this.modalPopups >= 1) {clearInterval(this.modalPopupIntervalId);}
    //   else {
    //     ++this.modalPopups;
    //     $('#discountModal').modal('show');
    //   }
    // }, 40000);
  
    // Closes navbar on click outside
    $(function() {
      $(document).click(function (event:any) {
        $('.navbar-collapse').collapse('hide');
      });
    });

    // Detects scroll for disappearing navbar
    $(window).scroll(function (event:any) {
      var scroll = $(window).scrollTop();
      if(scroll >= pageScroll) {
          pageScroll = scroll;
          if(stickyNav) {
            document.getElementById("mainNavbar")?.classList.remove("sticky-top");
            stickyNav = false; 
          } 
      }
      else {
        if(Math.abs(scroll - pageScroll) > 5) {
          pageScroll = scroll;
          document.getElementById("mainNavbar")?.classList.add("sticky-top");
          stickyNav = true;
        }
      }
    });

    // Getting contact form set up
    this.contactForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      number: ['', Validators.required],
      message: ['', Validators.required]
    });

    // Getting email modal form set up
    this.emailFormModal = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
    
    // Getting data and populating user info
    const data = JSON.parse(localStorage.getItem('userInfo') || '{}');
    this.sharedDataService.userInfo = [];
    for(let i:number = 0; i < data.length; ++i) {
      this.sharedDataService.userInfo.push(data[i]);
    }

    // User is not signed in
    if(this.sharedDataService.userInfo == undefined || this.sharedDataService.userInfo.length <= 1) {this.sharedDataService.signedIn = false;} 
    // User is signed in
    else {this.sharedDataService.signedIn = true;}

    // Setting up facebook and google signin
    if(!this.sharedDataService.signedIn) {
      this.authService.authState.subscribe((user: SocialUser) => {
        this.user = user;
        this.loggedIn = (user!=null);
        if(this.loggedIn) {
          let idToken:string = "";
          if(this.user.provider == "GOOGLE") {idToken = this.user.idToken;}
          if(this.user.provider == "FACEBOOK") {idToken = this.user.authToken;}
          this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/signupWithExternal?idtoken="+idToken+"&provider="+this.user.provider+"&userid="+this.user.id).subscribe(result => {
            this.sharedDataService.userInfo = JSON.stringify(result).split('[').join("").split(']').join("").split('"').join("").split(","); 
            if(this.sharedDataService.userInfo.length > 1) {
              this.sharedDataService.signedIn = true;
              $('#discountModal').modal('hide');
              if(true) {localStorage.setItem('userInfo', JSON.stringify(this.sharedDataService.userInfo));}
              this.router.navigate(['/']);
            }
            else if(this.sharedDataService.userInfo.length == 1 && this.sharedDataService.userInfo[0] == -1) {
              // alert("A user with that email already exists.");
              this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/loginWithExternal?idtoken="+idToken+"&provider="+this.user.provider+"&userid="+this.user.id).subscribe(result => {
                this.sharedDataService.userInfo = JSON.stringify(result).split('[').join("").split(']').join("").split('"').join("").split(","); 
                if(this.sharedDataService.userInfo.length > 1) {
                  this.sharedDataService.signedIn = true;
                  $('#discountModal').modal('hide');
                  if(true) {localStorage.setItem('userInfo', JSON.stringify(this.sharedDataService.userInfo));}
                  this.router.navigate(['/']);
                } 
              });
            } 
          });
        }
      });
    }

    // Getting panelsets from database
    this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/panels").subscribe(result => {
      let panelData = JSON.parse(JSON.stringify(result));
      
      if(panelData.length > 1) {
        // console.log(panelData);
        this.sharedDataService.svgTemplateData = [];
        for(let i:number = 0; i < 300; ++i) {this.sharedDataService.svgTemplateData.push([]);}
        for(let i:number = 0; i < panelData.length; ++i) {
          let tmpSVG:SVGTemplate = new SVGTemplate(panelData[i][4]);
          let tmpD:string = (Math.abs(tmpSVG.width-320) <= .5 && Math.abs(tmpSVG.height-320) <= .5) ? tmpSVG.getLineScaledD((300-6)/320, (300-6)/320) : tmpSVG.getOptimizedD();
          let tmp:{id:number, name:string, panelNumber:number, d:string, panelAutofillString:string} = {id:panelData[i][1], name:panelData[i][3], panelNumber:panelData[i][2], d:tmpD, panelAutofillString:panelData[i][5]};
          this.sharedDataService.svgTemplateData[panelData[i][1]].push(tmp);
        }
      }
      else {alert("error"); this.sharedDataService.svgTemplateData = [];}
      while(this.sharedDataService.svgTemplateData[this.sharedDataService.svgTemplateData.length-1].length == 0) {
        this.sharedDataService.svgTemplateData.pop();
      }
      // console.log(this.loginForm.value);
      // console.log(this.sharedDataService.userInfo);
    });

        // Getting templates from database
        this.sharedDataService.templateData = []
        this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/templates?numberPanelsX=-1&numberPanelsY=-1").subscribe(result => {
          let tmp = JSON.parse(JSON.stringify(result));
          this.sharedDataService.templateData = []
          if(tmp.length >= 1) {
            // console.log(templateData);
            for(let i:number = 0; i < tmp.length; ++i) {
              let currentTmp:{id:number, numPanels:number, panelDims:number[], tempString:string, category:string} = {id:tmp[i][0], numPanels:tmp[i][1]*tmp[i][2], panelDims:[tmp[i][1], tmp[i][2]], tempString:tmp[i][3], category:tmp[i][5]};
              this.sharedDataService.templateData.push(currentTmp);
            }
          }
          else {alert("error"); this.sharedDataService.templateData = [];}
          // console.log(this.loginForm.value);
          // console.log(this.sharedDataService.userInfo);
        });


        // Getting pane colors from database
        this.sharedDataService.colorsData = []
        this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/panecolors").subscribe(result => {
          let tmp = JSON.parse(JSON.stringify(result));
          this.sharedDataService.colorsData = []
          if(tmp.length >= 1) {
            // console.log(templateData);
            for(let i:number = 0; i < tmp.length; ++i) {
              let currentTmp:{id:number, name:string, hex:string, paneColor:boolean, isAvailable:boolean, placementID:number, opacity:number} = {id:tmp[i][0], name:tmp[i][1], hex:tmp[i][2], paneColor:true, isAvailable:tmp[i][3], placementID:tmp[i][4], opacity:tmp[i][5]};
              this.sharedDataService.colorsData.push(currentTmp);
            }
          }
          else {alert("error"); this.sharedDataService.templateData = [];}
          // console.log(this.loginForm.value);
          // console.log(this.sharedDataService.userInfo);
        });
        
  }
  
}
