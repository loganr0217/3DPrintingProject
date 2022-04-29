import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/services/loginservice/user';
import { UserLoginService } from 'src/app/services/loginservice/user-login.service';

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
  userMail: string;
  userPassword: string;
  user = new User();

  constructor(private formBuilder: FormBuilder, private userService: UserLoginService, private router: Router) { }

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
    if (this.loginForm.invalid) {
      return;
    }

    if (this.userMail !== undefined || this.userMail !== null) {
      this.user.userMail = this.userMail;
    }

    if (this.userPassword !== undefined || this.userPassword !== null) {
      this.user.userPassword = this.userPassword;
    }

    this.userService.getUserLogin(this.user)
      .subscribe(data => {
        console.log(data);
        if (data !== undefined || data !== []) {
          this.router.navigate(['']);
        }
        else {
          alert("error occur while registring User. please try after sometime.");
        }
      });
  }

}
