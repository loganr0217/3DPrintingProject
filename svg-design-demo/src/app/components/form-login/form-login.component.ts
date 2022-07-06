import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';

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
  constructor(private formBuilder: FormBuilder) { }

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

    // stop here if form is invalid
    // if (this.registerForm.invalid) {
    //     return;
    // }

    // alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.registerForm.value))
    console.log(this.loginForm.value);
  }

  goToPage(url: string) {
    window.location.href = this.fakeUrl + url;
  }

}
