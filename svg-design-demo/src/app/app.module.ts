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
    ForgotPassComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
