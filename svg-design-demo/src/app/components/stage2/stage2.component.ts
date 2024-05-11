import { Component, OnInit } from '@angular/core';
import { ContentfulService } from 'src/app/services/contentful.service';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { DividerWindow } from '../svgScaler';
import { Entry } from 'contentful';
import { DomSanitizer } from '@angular/platform-browser';
import { Form, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-stage2',
  templateUrl: './stage2.component.html',
  styleUrls: ['./stage2.component.css']
})
export class Stage2Component implements OnInit {
  posts:Entry<any>[] = [];
  howToPosts:Entry<any>[] = [];
  emailForm!:UntypedFormGroup;
  userCouponCodes:any;

  constructor(public sharedDataService:SharedDataService, public contentfulService:ContentfulService,
    private sanitizer:DomSanitizer, private http:HttpClient, private formBuilder:UntypedFormBuilder) { }
  
  // Stage 2 attributes
  dividerType:string;
  windowShape:string;
  windowShapes:string[];

  // Convenience getters for easy access to form fields
  get email() {return this.emailForm.get('email');}

  ngOnInit(): void {
    // Getting contact form set up
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.contentfulService.getPosts('stage2').then(posts => this.posts = posts);
    this.contentfulService.getPostById('4ARLsx1buVa21eJfdJgm3T', 'howTo').then(post => this.howToPosts.push(post));
    this.dividerType = this.sharedDataService.selectedDividerType;
    this.windowShape = this.sharedDataService.selectedWindowShape;
    this.windowShapes = this.sharedDataService.windowShapes;

    // Getting coupon codes to check for coasters
    const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : "";
    const password:string = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[4] : "";
    this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/getusercouponcodes?email='"+email+"'&password='"+password+ "'").subscribe(result => {
      this.userCouponCodes = JSON.parse(JSON.stringify(result));
    });
  }

  isAnyCoasterCouponCodes():boolean {
    if(this.userCouponCodes == undefined || this.userCouponCodes.length == 0) {return false;}
    for(let index:number = 0; index < this.userCouponCodes.length; ++index) {
      if(this.userCouponCodes[index][3] == undefined) { 
        if(this.userCouponCodes[index][1].toString().includes("coasters_")) {return true;}
      }
    }
    return false;
  }

  // Email form submission
  submitEmailForm(signupLocation:string):void {
    const headers = { 'content-type': 'application/json'}  
    const body=JSON.stringify(
      {
        'email':this.email?.value,
        'location':signupLocation
      });
      
    // Making sure each field has data and it's valid
    if(this.email?.value != "" && this.email?.valid) {
        let fullMessage:string = "Is this the correct email?\n> " + this.email?.value;
      
        if (confirm(fullMessage)) {
          // this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/addpanel?email='"+email+"'&password='"+password+"'&panelSetId=" + panelSetId + "&panelNumber=" + panelNumber + "&panelName='" + panelName + "'&dAttribute='" + dAttribute + "'").subscribe(result => {
          //   let test = JSON.stringify(result).split('[').join("").split(']').join("").split('"').join("").split(",");
          //   alert(test);
          //  });
          this.http.post("https://backend-dot-lightscreendotart.uk.r.appspot.com/submitcontactform", body, {'headers':headers}).subscribe(result => {
            this.sharedDataService.userInfo = JSON.stringify(result).split('[').join("").split(']').join("").split('"').join("").split(","); 
            if(this.sharedDataService.userInfo.length > 1) {
              this.sharedDataService.signedIn = true;
              localStorage.setItem('userInfo', JSON.stringify(this.sharedDataService.userInfo));
              alert("You're now registered and should have recieved a confirmation email in your inbox.");
              this.sharedDataService.currentStepID = 1;
            }
            else if(this.sharedDataService.userInfo.length == 1 && this.sharedDataService.userInfo[0] == -1) {alert("A user with that email already exists.");}
          });;
          this.emailForm.reset();
        }
    }
    else {alert("Make sure to enter information in each field");}
  }


  displayWindowShapes(dividerType:string) {
    document.getElementById("section2")?.setAttribute("style", "visibility:visible;");
    document.getElementById("windowShapeImages")?.setAttribute("style", "visibility:visible;");
    for(let i = 0; i < this.windowShapes.length; ++i) {
        document.getElementById("windowShapeImage_"+this.windowShapes[i])?.setAttribute("src", "assets/img/windowButtons2/"+this.windowShapes[i]+this.sharedDataService.selectedDividerType+"Icon.png");
        document.getElementById("windowShapeImage_"+this.windowShapes[i])?.setAttribute("style", "visibility:visible;");
    }
  }

  getWindowShapeSrc(windowShape:string):string {
    if(this.sharedDataService.sampleOrder != '') {return "assets/img/windowButtons2/"+windowShape+"sample.svg";}
    return "assets/img/windowButtons2/"+windowShape+this.sharedDataService.selectedDividerType+"Icon.png";
  }

  getIconHighlight(iconType:string, iconName:string):string {
    if(iconType == "windowShape") {
      if(this.sharedDataService.sampleOrder == iconName) {return "border: 1px solid black;";}
      else if(this.sharedDataService.sampleOrder == '' && this.sharedDataService.selectedWindowShape == iconName) {return "border: 1px solid black;";}
      else {return "";}
    }
    else {
      if(this.sharedDataService.sampleOrder != '' && iconName == 'sample') {return "border: 1px solid black;";}
      else if(this.sharedDataService.sampleOrder == '' && this.sharedDataService.selectedDividerType == iconName) {return "border: 1px solid black;";}
      else {return "";}
    }
  }


  // Method to change the currently selected divider
  chooseDivider(dividerType:string) {
    // User needs to sign in (used to require email signup with false being !this.sharedDataService.signedIn)
    // if(window.innerWidth > 576 && false) {
    //   document.getElementById("requiredEmailFieldStep0")?.focus();
    //   document.getElementById("requiredEmailFieldStep0")?.blur();
    //   document.getElementById("requiredEmailFieldStep0")?.focus();
    //   return;
    // }
    if(window.innerWidth > 576) {
      this.sharedDataService.currentStepID = 2;
      const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : 'undefined';
      this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/updatesession?sessionID="+this.sharedDataService.sessionID+"&lastStepID="+this.sharedDataService.currentStepID+"&startingURL='"+this.sharedDataService.sessionStartingUrl+"'&userEmail='"+email+"'").subscribe(result => { 
      });
    }
    

    document.getElementById("windowShapeText")?.setAttribute("style", "visibility:visible;");
    document.getElementById("windowShapeTextMobile")?.setAttribute("style", "visibility:visible;");
    document.getElementById("section2")?.setAttribute("style", "visibility:visible;");
    document.getElementById("windowShapeExamples")?.setAttribute("style", "visibility:visible;");
    // Unhighlighting old selection if possible and highlighting new one
    if(this.dividerType != null) {document.getElementById("dividerTypeImage_"+this.dividerType)?.setAttribute("style", "");}
    // document.getElementById("dividerTypeImage_"+dividerType)?.setAttribute("style", "filter: invert(25%);");
    if(dividerType == "nodiv") {
      // document.getElementById("dividerDetailsText")!.innerHTML = "";
      document.getElementById("horizontalDividersInput")?.setAttribute("disabled", "true");
      document.getElementById("verticalDividersInput")?.setAttribute("disabled", "true");
      document.getElementById("dividerDetailInputs")?.setAttribute("style", "display:none;");
    }
    else {
      // document.getElementById("dividerDetailsText")!.innerHTML = "Now, tell us the number of window dividers and their width.";
      document.getElementById("horizontalDividersInput")?.removeAttribute("disabled");
      document.getElementById("verticalDividersInput")?.removeAttribute("disabled");
      document.getElementById("dividerDetailInputs")?.setAttribute("style", "display:inline;");
    }
    
    // Updating values for dividerType
    if(dividerType == "sample") {
      this.sharedDataService.sampleOrder = "sample";
      this.sharedDataService.selectedDividerType = "nodiv";
      this.dividerType = "nodiv";
    }
    else {
      this.sharedDataService.sampleOrder = "";
      this.sharedDataService.selectedDividerType = dividerType;
      this.dividerType = dividerType;
    }
    

    // Updating the dividerWindow if it exists already
    if(this.sharedDataService.dividerWindow != null) {
      this.sharedDataService.dividerWindow.updateDividerType(dividerType);
      document.getElementById("windowPerimeter")?.setAttribute("d", this.sharedDataService.dividerWindow.dString);
    }

    this.displayWindowShapes(dividerType);
  }

  chooseWindowExample(windowExample:string):void {
    document.getElementById("windowShapeExamples")?.setAttribute("src", "");
    document.getElementById("windowShapeExamples")?.setAttribute("style", "visibility:hidden;");
    this.displayWindowShapes(windowExample);
  }

  // Method to change the currently selected window shape
  chooseWindowShape(windowShape:string) {
    // Unhighlighting old selection if possible and highlighting new one
    // if(this.windowShape != null) {document.getElementById("windowShapeImage_"+this.windowShape)?.setAttribute("style", "");}
    // document.getElementById("windowShapeImage_"+windowShape)?.setAttribute("style", "filter: invert(25%);");
    
    // Updating values for windowShape
    if(this.sharedDataService.sampleOrder != '') {
      this.sharedDataService.sampleOrder = windowShape;
      this.windowShape = 'vertical2to4';
      this.sharedDataService.selectedWindowShape = 'vertical2to4';
    }
    else {
      this.windowShape = windowShape;
      this.sharedDataService.selectedWindowShape = windowShape;
    }
    
    if(window.innerWidth > 576 && this.sharedDataService.sampleOrder == '') {
      this.sharedDataService.currentStepID = 3;
      const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : 'undefined';
      this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/updatesession?sessionID="+this.sharedDataService.sessionID+"&lastStepID="+this.sharedDataService.currentStepID+"&startingURL='"+this.sharedDataService.sessionStartingUrl+"'&userEmail='"+email+"'").subscribe(result => { 
      });
    }
    if(window.innerWidth > 576 && this.sharedDataService.sampleOrder != '') {
      this.sharedDataService.currentStepID = 4;
      const email:any = this.sharedDataService.userInfo.length > 1 ? this.sharedDataService.userInfo[3] : 'undefined';
      this.http.get("https://backend-dot-lightscreendotart.uk.r.appspot.com/updatesession?sessionID="+this.sharedDataService.sessionID+"&lastStepID="+this.sharedDataService.currentStepID+"&startingURL='"+this.sharedDataService.sessionStartingUrl+"'&userEmail='"+email+"'").subscribe(result => { 
      });
    }

    // Getting type of window and default dimensions
    let windowDimensions:string[] = windowShape.slice(windowShape.length-4).split("to");
    let widthHeightRatio:number = Number(windowDimensions[0])/Number(windowDimensions[1]);
    let numHorizontalDividers:number = Number(windowDimensions[1])-1;
    let numVerticalDividers:number = Number(windowDimensions[0])-1;
    let defaultWidth:number;
    if(widthHeightRatio >= 1) {defaultWidth = 400;}
    else {defaultWidth = 100;}
    let defaultHeight:number = defaultWidth / widthHeightRatio;

    // Setting default dimensions for step 3
    this.updateDimensions(defaultWidth, defaultHeight, numHorizontalDividers, numVerticalDividers);
    this.sharedDataService.topSash = true;
    if(this.isDoubleHung()) {
      this.sharedDataService.finishedSashes = false;
      document.getElementById("submitInput")?.setAttribute("disabled", "true");
    }
    else {
      this.sharedDataService.finishedSashes = true;
      document.getElementById("submitInput")?.removeAttribute("disabled");
    }

    // Sample order
    if(this.sharedDataService.sampleOrder != '') {
      this.sharedDataService.resetFractionNums();
      this.sharedDataService.unitChoice = 'mm';
      // Coasters default 2x2 each 4in^2
      if(this.sharedDataService.sampleOrder == 'coasters') {
        this.sharedDataService.selectedDividerType = "raiseddiv";
        this.sharedDataService.dividerWidth = 1;
        this.sharedDataService.dividerNumbers = [1, 1];
        this.sharedDataService.windowWidth = 204.2;
        this.sharedDataService.windowHeight = 204.2;
        this.sharedDataService.panelLayout = [];
        for(let i:number = 0; i < 2; ++i) {
          this.sharedDataService.panelLayout.push([]);
        }
        this.sharedDataService.panelLayoutDims = [2, 2];
      }
      // Lightcatcher each 12in^2
      else if(this.sharedDataService.sampleOrder == 'lightcatcher') {
        this.sharedDataService.selectedDividerType = "nodiv";
        this.sharedDataService.dividerWidth = 0;
        this.sharedDataService.dividerNumbers = [0, 0];
        this.sharedDataService.windowWidth = 304.8;
        this.sharedDataService.windowHeight = 304.8;
        this.sharedDataService.panelLayout = [];
        for(let i:number = 0; i < 1; ++i) {
          this.sharedDataService.panelLayout.push([]);
        }
        this.sharedDataService.panelLayoutDims = [1, 1];
      }
      if(window.innerWidth > 576) {this.nextStageTemplateCategory();}
    }
    else if(window.innerWidth > 576) {
      document.getElementById("widthInput")?.focus();
      this.nextstage3();
    }
    this.sharedDataService.stage2Visible = false;
    this.sharedDataService.stage3Visible = true;
  }

  // Method to clear old panes
  clearOldDividerPanes():void {
    let numPanes:number = this.sharedDataService.dividerWindow.windowPanes.length * this.sharedDataService.dividerWindow.windowPanes[0].length; 
    for(let i = 0; i < numPanes; ++i) {
      document.getElementById("dividerPane"+i)?.setAttribute("d", "");
      document.getElementById("dividerPane"+i)?.setAttribute("style", "")
      document.getElementById("dividerPane"+i)?.setAttribute("transform", "");
    }
  }

  skipStep0():void {
    this.sharedDataService.currentStepID = 1;
    document.getElementById("stage2ACon")?.setAttribute("style", "visibility:visible;");
    document.getElementById("stage2ACon")?.scrollIntoView({behavior: 'smooth'});
  }

  // Method to update dimensions
  updateDimensions(newWidth:number, newHeight:number, horizontalDividers:number, verticalDividers:number):void {
    if(this.sharedDataService.dividerWindow != null) {this.clearOldDividerPanes();}
    
    // Getting the user's desired width and height and divider info
    // let newWidth:number = Number((<HTMLInputElement>document.getElementById("widthInput")).value);
    // let newHeight:number = Number((<HTMLInputElement>document.getElementById("heightInput")).value);
    let horzDividers:number;
    let vertDividers:number;
    let dividerWidth:number;
    if(this.sharedDataService.selectedDividerType == "nodiv") {
      horzDividers = 0;
      vertDividers = 0;
      dividerWidth = 0;
    }
    else {
      horzDividers = horizontalDividers;
      vertDividers = verticalDividers;
      dividerWidth = 2;
    }
    let newDividerWindow:DividerWindow = new DividerWindow(newWidth, newHeight, horzDividers, vertDividers, dividerWidth, this.sharedDataService.selectedDividerType, this.windowShape.substring(0, 2) == "2x" ? true : false);

    // Updating template dimensions
    document.getElementById("windowPerimeter")?.setAttribute("d", newDividerWindow.dString);
    document.getElementById("windowPerimeter")?.setAttribute("style", "fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:.2;");
    let viewboxValue:string = newDividerWindow.getViewbox();
    document.getElementById("dividerTemplate")?.setAttribute("viewBox", viewboxValue);

    let paneNum:number = 0;
    for(let row:number = 0; row < newDividerWindow.windowPanes.length; ++row) {
      for(let col:number = 0; col < newDividerWindow.windowPanes[row].length; ++col) {
        // Updating each individual pane
        document.getElementById("dividerPane"+paneNum)?.setAttribute("d", newDividerWindow.windowPanes[row][col].dString);
        document.getElementById("dividerPane"+paneNum)?.setAttribute("style", "fill-rule:evenodd;stroke:#000000;stroke-width:.2;");
        ++paneNum;
      }
      
    }

    this.sharedDataService.dividerWindow = newDividerWindow;
  }
  
  previousStage() {
    document.getElementById("entirePage")?.scrollIntoView({behavior: 'smooth'});
  }

  nextstage3() {
    document.getElementById("stage3")?.setAttribute("style", "visibility:visible;")
    document.getElementById("stage3")?.scrollIntoView({behavior: 'smooth'});
  }

  nextStageTemplateCategory():void {
    document.getElementById("templateCategoryStage")?.setAttribute("style", "visibility:visible;")
    document.getElementById("templateCategoryStage")?.scrollIntoView({behavior: 'smooth'});
  }

  dividerName(id:string):string {
    if(id == "nodiv") {return "No Dividers";}
    else if(id == "raiseddiv") {return "Raised Dividers";}
    else if(id == "embeddeddiv") {return "Embedded Dividers";}
    else if(id == "sample") {return "Samples";}
    else {return "";}
  }

  windowShapeExample(windowShape:string):string {
    if(windowShape == "square2to2") {return "Square";}
    else if(windowShape == "2xhung2to4") {return "Double Hung";}
    else if(windowShape == "horizontal4to1") {return "Horizontal";}
    else if(windowShape == "vertical2to4") {return "Casement";}
    else if(windowShape == "coasters") {return "Coaster Set";}
    else if(windowShape == "lightcatcher") {return "Lightcatcher";}
    else {return "";}
  }

  // Method to check whether selected window shape is a 2xHung
  isDoubleHung():boolean {
    if(this.sharedDataService.selectedWindowShape.substring(0, 2) == "2x") {return true;}
    return false;
  }

}
