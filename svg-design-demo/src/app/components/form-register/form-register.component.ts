import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedDataService } from 'src/app/services/shared-data.service';

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
  constructor(private formBuilder:FormBuilder, private http:HttpClient, public sharedDataService:SharedDataService) { }

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
    this.http.get("http://34.162.208.24:5000/signup?email="+String(this.emailid?.value)+"&password="+String(this.password?.value)+"&firstname="+String(this.firstName?.value)+"&lastname="+String(this.lastName?.value)).subscribe(result => this.sharedDataService.userInfo = result);
    if(this.sharedDataService.userInfo = [-1]) {alert("A user with that email already exists.");}
    console.log(this.sharedDataService.userInfo);
    // stop here if form is invalid
    // if (this.registerForm.invalid) {
    //     return;
    // }

    // alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.registerForm.value))
    console.log(this.registerForm.value);
  }

}
