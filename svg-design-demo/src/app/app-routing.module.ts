import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutPageComponent } from './components/about-page/about-page.component';
import { ColorPageComponent } from './components/color-page/color-page.component';
import { FaqPageComponent } from './components/faq-page/faq-page.component';
import { ForgotPassComponent } from './components/forgot-pass/forgot-pass.component';
import { FormLoginComponent } from './components/form-login/form-login.component';
import { FormRegisterComponent } from './components/form-register/form-register.component';
import { GalleryPageComponent } from './components/gallery-page/gallery-page.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { MissionPageComponent } from './components/mission-page/mission-page.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { TutorialsPageComponent } from './components/tutorials-page/tutorials-page.component';
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
    path: "about",
    component: AboutPageComponent
  },
  {
    path: "mission",
    component: MissionPageComponent
  },
  {
    path: "tutorials",
    component: TutorialsPageComponent
  },
  {
    path: "faq",
    component: FaqPageComponent
  },
  {
    path: "gallery",
    component: GalleryPageComponent
  },
  {
    path: "forgot-pass",
    component: ForgotPassComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
