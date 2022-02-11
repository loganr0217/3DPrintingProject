import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ImageDetailComponent } from './image-view/image-detail/image-detail.component';
import { PopupComponent } from './image-view/popup-model/popup.component';

@NgModule({
  declarations: [
    AppComponent,
    PopupComponent,
    ImageDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
