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

@NgModule({
  declarations: [
    AppComponent,
    DesignWindowComponent,
    ColorsContainerComponent,
    ColorsSelectionButtonComponent,
    DimensionsFormComponent,
    TemplateIconComponent,
    TemplateSelectionContainerComponent,
    WindowPreviewContainerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
