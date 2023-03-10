import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: UntypedFormGroup;
  pass!: string;
  isShow!: boolean;
  cpass!: string;
  isCshow!: boolean;
  newPw!: string;
  confirmPw!: string;
  fakeUrl: string = 'http://localhost:4200/';
  constructor(private formBuilder: UntypedFormBuilder, private http:HttpClient, private router:Router) { }

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
    let paramString = window.location.href.split('?')[1];
    let queryString = new URLSearchParams(paramString);

    let resetToken:string = queryString.get('resettoken')!;
    let email:string = queryString.get('email')!;

    if(this.confirmPw === this.newPw) {
      // Resetting password
      this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/resetpassword?email="+email+"&resettoken="+resetToken+"&password="+String(this.newPassword?.value)).subscribe(result => {
        this.router.navigate(['/']);
      });
    }else {
      this.resetForm.setErrors({'invalid': true});
    }
  }

  onCancel() {
    window.location.href = '';
  }
}
