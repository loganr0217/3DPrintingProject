import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutPageComponent } from './components/about-page/about-page.component';
import { ColorOfferingsPageComponent } from './components/color-offerings-page/color-offerings-page.component';
import { ColorPageComponent } from './components/color-page/color-page.component';
import { CouponCodeGenerationPageComponent } from './components/coupon-code-generation-page/coupon-code-generation-page.component';
import { FaqPageComponent } from './components/faq-page/faq-page.component';
import { ForgotPassComponent } from './components/forgot-pass/forgot-pass.component';
import { FormLoginComponent } from './components/form-login/form-login.component';
import { FormRegisterComponent } from './components/form-register/form-register.component';
import { GalleryPageComponent } from './components/gallery-page/gallery-page.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { MissionPageComponent } from './components/mission-page/mission-page.component';
import { OrderPageComponent } from './components/order-page/order-page.component';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { TutorialsPageComponent } from './components/tutorials-page/tutorials-page.component';
import { YourIdentifyComponent } from './components/verify-identity/your-identify/your-identify.component';
import { BlogPageComponent } from './components/blog-page/blog-page.component';
import { OrderSuccessComponent } from './components/order-success/order-success.component';
import { OrderFailureComponent } from './components/order-failure/order-failure.component';
import { DealerPageComponent } from './components/dealer-page/dealer-page.component';
import { UserDirectoryComponent } from './components/user-directory/user-directory.component';
import { MarketingMainPageComponent } from './components/marketing-main-page/marketing-main-page.component';

const routes: Routes = [
  { path: '', redirectTo: 'light-screen', pathMatch: 'full' },
  { path: 'tiktok', redirectTo: 'light-screen-ads', pathMatch: 'full' },
  { path: 'instagram', redirectTo: 'light-screen-ads', pathMatch: 'full' },
  { path: 'facebook', redirectTo: 'light-screen-ads', pathMatch: 'full' },
  { path: 'google-search', redirectTo: 'light-screen-ads', pathMatch: 'full' },
  { path: 'google-display', redirectTo: 'light-screen-ads', pathMatch: 'full' },
  { path: 'mailchimp', redirectTo: 'light-screen-ads', pathMatch: 'full' },
  { path: 'twitter', redirectTo: 'light-screen-ads', pathMatch: 'full' },
  { path: 'linkedin', redirectTo: 'light-screen-ads', pathMatch: 'full' },
  { path: 'pinterest', redirectTo: 'light-screen-ads', pathMatch: 'full' },
  { path: 'twitter', redirectTo: 'light-screen-ads', pathMatch: 'full' },
  { path: 'light-screen', component: MainPageComponent
    // children: [
    //   { path: '/', redirectTo: 'detail', terminal: true },
    //   { path: 'detail', component: HeroDetailComponent }
    // ] 
  },
  { path: 'light-screen-ads', component: MarketingMainPageComponent
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
    path: "profile",
    component: ProfilePageComponent
  },
  {
    path: "orders",
    component: OrderPageComponent
  },
  {
    path: "colorOfferings",
    component: ColorOfferingsPageComponent
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
  },
  {
    path: "couponGeneration",
    component: CouponCodeGenerationPageComponent
  },
  {
    path: "blogPage",
    component: BlogPageComponent
  },
  {
    path: "orderSuccess",
    component: OrderSuccessComponent
  },
  {
    path: "orderFailure",
    component: OrderFailureComponent
  },
  {
    path: "dealerPage",
    component: DealerPageComponent
  },
  {
    path: "userDirectory",
    component: UserDirectoryComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
