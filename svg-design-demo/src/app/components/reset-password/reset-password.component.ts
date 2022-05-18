import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/services/loginservice/user';
import { UserLoginService } from 'src/app/services/loginservice/user-login.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  pass!: string;
  isShow!: boolean;
  cpass!: string;
  isCshow!: boolean;
  newPw!: string;
  confirmPw!: string;
  fakeUrl: string = 'http://localhost:4200/';
  user!: any;
  
  constructor(private formBuilder: FormBuilder, private userService: UserLoginService, private router: Router) { }

  ngOnInit(): void {
    this.resetForm = this.formBuilder.group({
      newPass: ['', [Validators.required,Validators.minLength(8), Validators.maxLength(24)]],
      confirmPass: ['', Validators.required]
    });
    this.isShow = false;
    this.pass = 'password';
    this.cpass = 'password';
    this.isCshow = false;
  }

  get newPassword() {
    return this.resetForm.get('newPass');
  }

  get confirmPassword() {
    return this.resetForm.get('confirmPass');
  }

  showConfirmPass() {
    if (this.cpass === 'password') {
      this.cpass = 'text';
      this.isCshow = true;
    } else {
      this.cpass = 'password';
      this.isCshow = false;
    }
  }

  showNewPass() {
    if (this.pass === 'password') {
      this.pass = 'text';
      this.isShow = true;
    } else {
      this.pass = 'password';
      this.isShow = false;
    }
  }

  onSubmit() {
    this.user = new User();
    // this.user = this.userService.getData();
    this.user.userMail = localStorage.getItem('userMail');
    if(this.confirmPw === this.newPw) {
      this.user.userPassword = this.newPw;
      this.userService.resetPass(this.user)
      .subscribe(data => {
        if (data !== undefined || data !== []) {
          this.router.navigate(['login']);
        }
        else {
          alert("error occur while registring User. please try after sometime.");
        }
      });
    }else {
      this.resetForm.setErrors({'invalid': true});
    }
  }

  onCancel() {
    window.location.href = '';
  }
}
