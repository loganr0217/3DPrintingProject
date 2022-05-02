import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/services/loginservice/user';
import { UserLoginService } from 'src/app/services/loginservice/user-login.service';

@Component({
  selector: 'app-your-identify',
  templateUrl: './your-identify.component.html',
  styleUrls: ['./your-identify.component.css']
})
export class YourIdentifyComponent implements OnInit {

  verifyForm!: FormGroup;
  user!: any;
  
  constructor(private formBuilder: FormBuilder, private userService: UserLoginService, private router: Router) { }

  ngOnInit(): void {
    this.verifyForm = this.formBuilder.group({
      num1: ['', [Validators.required, Validators.maxLength(1)]],
      num2: ['', [Validators.required, Validators.maxLength(1)]],
      num3: ['', [Validators.required, Validators.maxLength(1)]],
      num4: ['', [Validators.required, Validators.maxLength(1)]]
    });
  }

  get number1() {
    return this.verifyForm.get('num1');
  }

  get number2() {
    return this.verifyForm.get('num2');
  }

  get number3() {
    return this.verifyForm.get('num3');
  }

  get number4() {
    return this.verifyForm.get('num4');
  }

  onSubmit() {
    let codeDigist = this.verifyForm.value.num1 + this.verifyForm.value.num2 + 
      this.verifyForm.value.num3 + this.verifyForm.value.num4;
    this.user = new User();
    this.user = this.userService.getData();
    this.user.codeDigist = codeDigist;
    console.log(this.user);

    this.userService.registUser(this.user)
    .subscribe(data => {
      if (data !== undefined || data !== []) {
        this.router.navigate(['login']);
      }
      else {
        alert("error occur while registring User. please try after sometime.");
      }
    });

  }
}
