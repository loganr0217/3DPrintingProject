import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-forgot-pass',
  templateUrl: './forgot-pass.component.html',
  styleUrls: ['./forgot-pass.component.css']
})
export class ForgotPassComponent implements OnInit {

  forgotForm!: UntypedFormGroup
  email!: string;
  fakeUrl: string = 'http://localhost:4200/';
  constructor(private formBuilder: UntypedFormBuilder, private http:HttpClient, private sharedDataService:SharedDataService, private router:Router) { }

  ngOnInit(): void {
    this.forgotForm = this.formBuilder.group({
      emailId: ['', [Validators.required, Validators.email]]
    });
  }

  get emailid() {
    return this.forgotForm.get('emailId');
  }

  onSubmit() {
    // Sending reset password link to user
    this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/forgotpassword?email="+String(this.emailid?.value)).subscribe(result => {
      this.router.navigate(['/']);
    });
  }

}
