import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/services/loginservice/user';
import { UserLoginService } from 'src/app/services/loginservice/user-login.service';

@Component({
  selector: 'app-forgot-pass',
  templateUrl: './forgot-pass.component.html',
  styleUrls: ['./forgot-pass.component.css']
})
export class ForgotPassComponent implements OnInit {

  forgotForm!: FormGroup
  email!: string;
  fakeUrl: string = 'http://localhost:4200/';
  user!: any;
  constructor(private formBuilder: FormBuilder, private userService: UserLoginService, private router: Router) { }

  ngOnInit(): void {
    this.forgotForm = this.formBuilder.group({
      emailId: ['', [Validators.required, Validators.email]]
    });
  }

  get emailid() {
    return this.forgotForm.get('emailId');
  }

  onSubmit() {
    this.user = new User();
    this.user.userMail = this.email;
    this.userService.sendReset(this.user)
    .subscribe(data => {
      if (data !== undefined || data !== []) {
        // this.router.navigate(['reset-pass']);
        // this.userService.publishData(this.user);
        localStorage.setItem('userMail', this.user.userMail);
        alert("sent mail. Pleace check mail");
      }
      else {
        alert("error occur while registring User. please try after sometime.");
      }
    });
    // window.location.href = this.fakeUrl + 'reset-pass';
  }

}
