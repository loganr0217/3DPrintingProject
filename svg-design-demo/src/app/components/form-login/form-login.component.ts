import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'form-login',
  templateUrl: './form-login.component.html',
  styleUrls: ['./form-login.component.css']
})
export class FormLoginComponent implements OnInit {
  loginForm!: UntypedFormGroup;
  submitted = false;
  passW!: string;
  email!: string;
  isShow!: boolean;
  pass!: string;
  fakeUrl: string = 'http://localhost:4200/';
  constructor(private formBuilder:UntypedFormBuilder, private http:HttpClient, public sharedDataService:SharedDataService, 
    private router:Router) { }

  ngOnInit():void {
    this.loginForm = this.formBuilder.group({
      emailId: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.isShow = false;
    this.pass = 'password';
    
  }

  // convenience getter for easy access to form fields
  get emailid() {
    return this.loginForm.get('emailId');
  }

  get password() {
    return this.loginForm.get('password');
  }

  // signInWithFB(): void {
  //   this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  // }

  onClickShowPass() {
    if (this.pass === 'password') {
      this.pass = 'text';
      this.isShow = true;
    } else {
      this.pass = 'password';
      this.isShow = false;
    }
  }

   // function submit
   onSubmit() {
    this.submitted = true;

    this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/login?email='"+String(this.emailid?.value)+"'&password='"+String(this.password?.value)+"'").subscribe(result => {
      this.sharedDataService.userInfo = JSON.stringify(result).split('[').join("").split(']').join("").split('"').join("").split(",");
      if(this.sharedDataService.userInfo.length > 1) {
        this.sharedDataService.signedIn = true;
        if((<HTMLInputElement>document.getElementById("rememberMeBox"))?.checked) {localStorage.setItem('userInfo', JSON.stringify(this.sharedDataService.userInfo));}
        this.router.navigate(['/']);
      }
      else {
        alert("A user with this information can not be found in our system.");
      }
    });
    // stop here if form is invalid
    // if (this.registerForm.invalid) {
    //     return;
    // }

    // alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.registerForm.value))
  }

  goToPage(url: string) {
    window.location.href = this.fakeUrl + url;
  }

}
