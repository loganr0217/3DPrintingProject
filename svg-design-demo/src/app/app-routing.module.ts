import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ColorPageComponent } from './components/color-page/color-page.component';
import { ForgotPassComponent } from './components/forgot-pass/forgot-pass.component';
import { FormLoginComponent } from './components/form-login/form-login.component';
import { FormRegisterComponent } from './components/form-register/form-register.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { YourIdentifyComponent } from './components/verify-identity/your-identify/your-identify.component';

const routes: Routes = [
  { path: '', redirectTo: 'light-screen', pathMatch: 'full' },
  { path: 'light-screen', component: MainPageComponent
    // children: [
    //   { path: '/', redirectTo: 'detail', terminal: true },
    //   { path: 'detail', component: HeroDetailComponent }
    // ] 
  },
  {
    path: "login",
    component: FormLoginComponent
  },
  {
    path: "windowCreation",
    component: ColorPageComponent
  },
  {
    path: "signup",
    component: FormRegisterComponent
  },
  {
    path: "verify-code",
    component: YourIdentifyComponent
  },
  {
    path: "reset-pass",
    component: ResetPasswordComponent
  },
  {
    path: "forgot-pass",
    component: ForgotPassComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
