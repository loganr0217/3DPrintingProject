import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'form-register',
  templateUrl: './form-register.component.html',
  styleUrls: ['./form-register.component.css']
})
export class FormRegisterComponent implements OnInit {
  registerForm!: FormGroup;
  passW!: string;
  confirmPass!: string;
  isPass: boolean = true;
  pass!: string;
  isShow!: boolean;
  cpass!: string;
  isCshow!: boolean;
  fakeUrl: string = 'http://localhost:4200/';
  constructor(private formBuilder:FormBuilder, private http:HttpClient, public sharedDataService:SharedDataService, private router:Router) { }

  @ViewChild('carousel') carousel: ElementRef;

  ngAfterContentInit(): void {
    setInterval(() => {
      this.carousel.nativeElement.click();
    }, 5000)
  }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      emailId: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(24)]],
      confirmPassword: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required]
    });
    this.isShow = false;
    this.pass = 'password';
    this.cpass = 'password';
    this.isCshow = false;
  }

  changeConfirmPass() {
    let a = this.passW;
    let b = this.confirmPass;
    if (a === b) {
      this.isPass = true;
    } else {
      this.isPass = false;
      if (b === '') {
        this.isPass = true;
      }
    }
  }

  // convenience getter for easy access to form fields
  get emailid() {
    return this.registerForm.get('emailId');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get firstName() {
    return this.registerForm.get('firstName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
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


  onClickShowConfirmPass() {
    if (this.cpass === 'password') {
      this.cpass = 'text';
      this.isCshow = true;
    } else {
      this.cpass = 'password';
      this.isCshow = false;
    }
  }

  // function submit
  onSubmit() {
    this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/signup?email='"+String(this.emailid?.value)+"'&password='"+String(this.password?.value)+"'&firstname='"+String(this.firstName?.value)+"'&lastname='"+String(this.lastName?.value+"'")).subscribe(result => {
      this.sharedDataService.userInfo = JSON.stringify(result).split('[').join("").split(']').join("").split('"').join("").split(","); 
      if(this.sharedDataService.userInfo.length > 1) {
        this.sharedDataService.signedIn = true;
        if((<HTMLInputElement>document.getElementById("rememberMeBox"))?.checked) {localStorage.setItem('userInfo', JSON.stringify(this.sharedDataService.userInfo));}
        this.router.navigate(['/']);
      }
      else if(this.sharedDataService.userInfo.length == 1 && this.sharedDataService.userInfo[0] == -1) {alert("A user with that email already exists.");} 
      // console.log(this.registerForm.value);
      // console.log(this.sharedDataService.userInfo);
    });
    // stop here if form is invalid
    // if (this.registerForm.invalid) {
    //     return;
    // }

    // alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.registerForm.value))
    
  }

}
