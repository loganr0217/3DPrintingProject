import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'form-login',
  templateUrl: './form-login.component.html',
  styleUrls: ['./form-login.component.css']
})
export class FormLoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  passW!: string;
  email!: string;
  isShow!: boolean;
  pass!: string;
  fakeUrl: string = 'http://localhost:4200/';
  constructor(private formBuilder:FormBuilder, private http:HttpClient, public sharedDataService:SharedDataService, private router:Router) { }

  @ViewChild('carousel') carousel: ElementRef;

  ngAfterContentInit(): void {
    setInterval(() => {
      this.carousel.nativeElement.click();
    }, 5000)
  }

  ngOnInit(): void {
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
        this.router.navigate(['/']);
      }
      // console.log(this.loginForm.value);
      // console.log(this.sharedDataService.userInfo);
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
