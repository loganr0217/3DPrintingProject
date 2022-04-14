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
    DividerWindowComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
