import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DesignWindowComponent } from './components/design-window/design-window.component';
import { ColorsContainerComponent } from './components/colors-container/colors-container.component';
import { ColorsSelectionButtonComponent } from './components/colors-selection-button/colors-selection-button.component';
import { DimensionsFormComponent } from './components/dimensions-form/dimensions-form.component';
import { TemplateIconComponent } from './components/template-icon/template-icon.component';
import { TemplateSelectionContainerComponent } from './components/template-selection-container/template-selection-container.component';
import { WindowPreviewContainerComponent } from './components/window-preview-container/window-preview-container.component';
import { Stage1Component } from './components/stage1/stage1.component';
import { Stage2Component } from './components/stage2/stage2.component';
import { Stage3Component } from './components/stage3/stage3.component';
import { Stage4Component } from './components/stage4/stage4.component';
import { Stage5Component } from './components/stage5/stage5.component';
import { DividerWindowComponent } from './components/divider-window/divider-window.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { FormLoginComponent } from './components/form-login/form-login.component';
import { FormRegisterComponent } from './components/form-register/form-register.component';
import { YourIdentifyComponent } from './components/verify-identity/your-identify/your-identify.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ForgotPassComponent } from './components/forgot-pass/forgot-pass.component';
import { TemplateCategoryStageComponent } from './components/template-category-stage/template-category-stage.component';
import { TemplateInfoFormComponent } from './components/template-info-form/template-info-form.component';
import { ColorPageComponent } from './components/color-page/color-page.component';
import { HttpClientModule } from '@angular/common/http';
import { CheckoutPageComponent } from './components/checkout-page/checkout-page.component';
import { AboutPageComponent } from './components/about-page/about-page.component';
import { GalleryPageComponent } from './components/gallery-page/gallery-page.component';
import { MissionPageComponent } from './components/mission-page/mission-page.component';
import { TutorialsPageComponent } from './components/tutorials-page/tutorials-page.component';
import { FaqPageComponent } from './components/faq-page/faq-page.component';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';
import { OrderPageComponent } from './components/order-page/order-page.component';
import { ColorOfferingsPageComponent } from './components/color-offerings-page/color-offerings-page.component';
import { CarouselComponent } from './components/carousel/carousel.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { SocialLoginModule, SocialAuthServiceConfig, GoogleInitOptions } from '@abacritt/angularx-social-login';
import {
  GoogleLoginProvider,
  FacebookLoginProvider
} from '@abacritt/angularx-social-login';
import { MobileColorPickerComponent } from './components/mobile-color-picker/mobile-color-picker.component';
import { CouponCodeGenerationPageComponent } from './components/coupon-code-generation-page/coupon-code-generation-page.component';
import { BlogPageComponent } from './components/blog-page/blog-page.component';
import { OrderSuccessComponent } from './components/order-success/order-success.component';
import { OrderFailureComponent } from './components/order-failure/order-failure.component';
import { DealerPageComponent } from './components/dealer-page/dealer-page.component';
import { UserDirectoryComponent } from './components/user-directory/user-directory.component';
import { MarketingMainPageComponent } from './components/marketing-main-page/marketing-main-page.component';

const googleLoginOptions:GoogleInitOptions = {
  oneTapEnabled: (JSON.parse(localStorage.getItem('userInfo') || '{}').length > 1 ? false : true), // user signed in before
};

@NgModule({
  declarations: [
    AppComponent,
    DesignWindowComponent,
    ColorsContainerComponent,
    ColorsSelectionButtonComponent,
    DimensionsFormComponent,
    TemplateIconComponent,
    TemplateSelectionContainerComponent,
    WindowPreviewContainerComponent,
    Stage1Component,
    Stage2Component,
    Stage3Component,
    Stage4Component,
    Stage5Component,
    DividerWindowComponent,
    MainPageComponent,
    FormLoginComponent,
    FormRegisterComponent,
    YourIdentifyComponent,
    ResetPasswordComponent,
    ForgotPassComponent,
    TemplateCategoryStageComponent,
    TemplateInfoFormComponent,
    ColorPageComponent,
    CheckoutPageComponent,
    AboutPageComponent,
    GalleryPageComponent,
    MissionPageComponent,
    TutorialsPageComponent,
    FaqPageComponent,
    ProfilePageComponent,
    OrderPageComponent,
    ColorOfferingsPageComponent,
    CarouselComponent,
    LandingPageComponent,
    MobileColorPickerComponent,
    CouponCodeGenerationPageComponent,
    BlogPageComponent,
    OrderSuccessComponent,
    OrderFailureComponent,
    DealerPageComponent,
    UserDirectoryComponent,
    MarketingMainPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    SocialLoginModule
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '474514984650-2f0dvbnbcjh2tolup348qjpolkh22rb1.apps.googleusercontent.com',
              googleLoginOptions
            )
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider('577140994305662')
          }
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
