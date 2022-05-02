import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/services/loginservice/user';
import { UserLoginService } from 'src/app/services/loginservice/user-login.service';

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
  userRegist!: User;
  fakeUrl: string = 'http://localhost:4200/';
  isProcess: boolean;
  constructor(private formBuilder: FormBuilder, private userService: UserLoginService, private router: Router) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      emailId: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(24)]],
      confirmPassword: ['', Validators.required],
      userName: ['', Validators.required]
    });
    this.isShow = false;
    this.pass = 'password';
    this.cpass = 'password';
    this.isCshow = false;
    this.userRegist = new User();
    this.isProcess = false;
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

  get userName() {
    return this.registerForm.get('userName');
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
    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    } else {
      this.isProcess = true;
      this.userRegist = new User();
      this.userRegist.userName = this.registerForm.value.userName;
      this.userRegist.userMail = this.registerForm.value.emailId;
      this.userRegist.userPassword = this.registerForm.value.password;

      this.userService.sendCode(this.userRegist)
      .subscribe(data => {
        if (data !== undefined || data !== []) {
          this.userService.publishData(this.userRegist);
          this.isProcess = false;
          this.router.navigate(['verify-code']);
        }
        else {
          alert("error occur while registring User. please try after sometime.");
        }
      });
      // window.location.href = this.fakeUrl + url;
      // this.router.navigate(['']);
    }
  }

}
