import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-pass',
  templateUrl: './forgot-pass.component.html',
  styleUrls: ['./forgot-pass.component.css']
})
export class ForgotPassComponent implements OnInit {

  forgotForm!: UntypedFormGroup
  email!: string;
  fakeUrl: string = 'http://localhost:4200/';
  constructor(private formBuilder: UntypedFormBuilder) { }

  ngOnInit(): void {
    this.forgotForm = this.formBuilder.group({
      emailId: ['', [Validators.required, Validators.email]]
    });
  }

  get emailid() {
    return this.forgotForm.get('emailId');
  }

  onSubmit() {
    window.location.href = this.fakeUrl + 'reset-pass';
  }

}
