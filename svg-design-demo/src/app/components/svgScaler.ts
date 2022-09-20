// Basic class for a window pane
export class WindowPane {
    dString:string;
    width:number;
    height:number;
    startPoint:number[];
    widthAdjusted:boolean;
    heightAdjusted:boolean;

    constructor(width:number = 0, height:number = 0, startPoint:number[] = [0,0], dString:string = "", widthAdjusted:boolean=false, heightAdjusted:boolean=false) {
        this.dString = dString;
        this.width = width;
        this.height = height;
        this.startPoint = startPoint
        this.widthAdjusted = widthAdjusted;
        this.heightAdjusted = heightAdjusted;
    }

    // Method to update attributes of pane with new values
    updateWindowPane(newWidth:number = this.width, newHeight:number = this.height, newStartPoint:number[]=this.startPoint):void {
        // Starting d attribute at new startPoint and changing width/height
        let dTmp:string = "M " + newStartPoint[0] + " " + newStartPoint[1] + " ";
        dTmp += "v " + newHeight + " h " + newWidth + " v " + (-newHeight) + " Z";;

        // Updating attributes
        this.width = newWidth;
        this.height = newHeight;
        this.startPoint = newStartPoint;
        this.dString = dTmp;
    }
}

// Class for creating a DividerWindow svg
export class DividerWindow {
    dString:string;
    numberHorizontalPanes:number;
    numberVerticalPanes:number;
    dividerWidth:number;
    windowWidth:number;
    windowHeight:number;
    windowPanes:WindowPane[][];
    windowSVG:SVGTemplate;
    remainingWidth:number;
    remainingHeight:number;
    dividerType:string;
    doubleHung:boolean;
    bottomSashWidth:number;
    bottomSashHeight:number;

    // Constructor which takes the width and height of the window
    constructor(width:number = 100, height:number = 100, numHorzDividers:number = 0, numVertDividers:number = 0, dividerWidth:number = 25.4, dividerType:string="plain", doubleHung:boolean=false, bottomSashWidth:number=-1, bottomSashHeight:number=-1) {
        this.dString = "";
        this.numberHorizontalPanes = numVertDividers + 1;
        this.numberVerticalPanes = numHorzDividers + 1;
        this.dividerWidth = dividerWidth;
        this.windowWidth = width;
        this.windowHeight = height;
        this.remainingWidth = width - (dividerWidth*numVertDividers);
        this.remainingHeight = height - (dividerWidth*numHorzDividers);
        this.dividerType = dividerType;
        this.doubleHung = doubleHung;
        this.bottomSashWidth = bottomSashWidth == -1 ? width : bottomSashWidth;
        this.bottomSashHeight = bottomSashHeight == -1 ? height : bottomSashHeight;
        
        // Initialize windowPanes
        this.windowPanes = [];
        this.initializeWindowPanes();
        this.createWindowPerimeter(width, height);

        this.windowSVG = new SVGTemplate(this.dString);
    }

    // Method to create window perimeter SVG using width and height
    createWindowPerimeter(width:number, height:number):void {
        this.dString = this.createSVGBox(width+50.8, height+50.8, true, [-25.4, -25.4]) + " " +
        this.createSVGBox(width+16.93, height+16.93, true, [-8.465, -8.465]);
        if(this.dividerType != "raiseddiv") {this.dString += this.createSVGBox(width, height, true, [0, 0]);}

        // creating bottom of 2xhung if necessary
        if(this.doubleHung) {
            this.dString += this.createSVGBox(this.bottomSashWidth+50.8, this.bottomSashHeight+50.8, true, [-25.4 - (this.bottomSashWidth-width)/2, height+25.4]) + " " +
            this.createSVGBox(this.bottomSashWidth+16.93, this.bottomSashHeight+16.93, true, [-8.465 - (this.bottomSashWidth-width)/2, height+42.93]);
            if(this.dividerType != "raiseddiv") {this.dString += this.createSVGBox(this.bottomSashWidth, this.bottomSashHeight, true, [0 - (this.bottomSashWidth-width)/2, height+51.395]);}
        }
    }

    // Method to update divider type
    updateDividerType(newDividerType:string):void {
        this.dividerType = newDividerType;
        this.createWindowPerimeter(this.windowWidth, this.windowHeight);
    }

    // Method to create an svg box with a certain width and height (counterClockwise used for inner shapes)
    createSVGBox(width:number, height:number, clockWise:boolean=false, startPoint:number[] = [0,0]):string {
        // Starting d attribute at startPoint
        let dTmp:string = "M " + startPoint[0] + " " + startPoint[1] + " ";

        // Drawing clockwise or counter-clockwise
        if(clockWise) {dTmp += "h " + width + " v " + height + " h " + (-width) + " Z";}
        else {dTmp += "v " + height + " h " + width + " v " + (-height) + " Z";}

        return dTmp;
    }

    // Method to initialize the windowPanes array with symmetrical window panes
    initializeWindowPanes():void {
        // Getting values for divider info
        let numberHorizontalDividers:number = this.numberVerticalPanes-1;
        let numberVerticalDividers:number = this.numberHorizontalPanes-1;
        let totalDividerWidth:number = this.dividerWidth*numberVerticalDividers;
        let totalDividerHeight:number = this.dividerWidth*numberHorizontalDividers;
        let paneWidth:number = (this.windowWidth - totalDividerWidth) / this.numberHorizontalPanes;
        let paneHeight:number = (this.windowHeight - totalDividerHeight) / this.numberVerticalPanes;

        // Initializing array
        let startingPoint:number[] = [0,0];
        for(let row = 0; row < this.numberVerticalPanes; ++row) {
            this.windowPanes[row] = [];
            for(let col = 0; col < this.numberHorizontalPanes; ++col) {
                startingPoint = [col*paneWidth + col*this.dividerWidth, row*paneHeight + row*this.dividerWidth];
                this.windowPanes[row][col] = new WindowPane(paneWidth, paneHeight, startingPoint, 
                    this.createSVGBox(paneWidth, paneHeight, false, startingPoint));
            }
        }

        if(this.doubleHung) {
            paneWidth = (this.bottomSashWidth - totalDividerWidth) / this.numberHorizontalPanes;
            paneHeight = (this.bottomSashHeight - totalDividerHeight) / this.numberVerticalPanes;
            // Initializing array
            startingPoint = [0 - (this.bottomSashWidth-this.windowWidth)/2,this.windowHeight];
            for(let row = this.numberVerticalPanes; row < 2*this.numberVerticalPanes; ++row) {
                this.windowPanes[row] = [];
                for(let col = 0; col < this.numberHorizontalPanes; ++col) {
                    startingPoint = [col*paneWidth + col*this.dividerWidth - (this.bottomSashWidth-this.windowWidth)/2, (this.windowHeight-this.bottomSashHeight) + row*paneHeight + row*this.dividerWidth + 51.395 - this.dividerWidth];
                    this.windowPanes[row][col] = new WindowPane(paneWidth, paneHeight, startingPoint, 
                        this.createSVGBox(paneWidth, paneHeight, false, startingPoint));
                }
            }
        }
    }

    // Method to get the full svg d attribute with panes
    getDWithPanes():string {
        let result:string = this.dString;
        // Adding each pane's d to the final dString
        for(let row = 0; row < this.numberHorizontalPanes; ++row) {
            for(let col = 0; col < this.numberVerticalPanes; ++col) {
                result += " " + this.windowPanes[row][col].dString;
            }
        }
        return result;
    }

    getViewbox():string {
        let viewboxValue:string = "";
        if(this.doubleHung) {
            viewboxValue = ""+ (-50.8 - (this.windowWidth >= this.bottomSashWidth ? 0 : (this.bottomSashWidth - this.windowWidth)/2)) +" "+ (-50.8) +" "+
            ((this.windowWidth >= this.bottomSashWidth ? this.windowWidth : this.bottomSashWidth)+101.6)+
            " "+(((this.windowHeight + (this.bottomSashHeight == -1 ? this.windowHeight : this.bottomSashHeight))+203.2));
            
        }
        else {viewboxValue = ""+ (-50.8) +" "+ (-50.8) +" "+(this.windowWidth+101.6)+" "+(this.windowHeight+101.6);}
        return viewboxValue;
    }
}

// Class for individual polygon object within an SVG design template
export class Polygon {
    /* 
    Parameters: 
        string: path of polygon
        number[]: point of last polygon (if applicable))
    Attributes:
        currentPoint:number[] --> holds the current location while parsing path
        startingPoint:number[] --> holds starting point of polygon in absolute coordinates
        scalablePath:string[] --> optimized path which allows for scaling
        {x/y}{minMax}:number --> holds the min/max point on x/y for this polygon
        polygonWidth:number --> width of polygon
        polygonHeight:number --> height of polygon
    Methods:
        updateMinMax():void {} --> updates the min/max attributes using currentPoint attribute
        parsePath(pathArray:string[]):void {} --> creates scalablePath using array of normal path commands
        outset():string {} --> returns the optimized path (will offset path eventually)
    */
    currentPoint:number[];
    startingPoint:number[];
    private scalablePath:string[];

    prevPolygonPoint:number[];

    // Values for max/min in x/y
    xMin:number;
    xMax:number;
    yMin:number;
    yMax:number;

    polygonWidth:number;
    polygonHeight:number;

    // Basic constructor with polygon path and previous polygon's last point (if applicable)
    constructor(polyPath:string, prevPolyPoint:number[] = []) {
        this.prevPolygonPoint = prevPolyPoint;
        
        this.startingPoint = [];
        this.scalablePath = [];

        this.parsePath(polyPath.split(" "));

        // Getting width and height of polygon
        this.polygonWidth = this.xMax - this.xMin;
        this.polygonHeight = this.yMax - this.yMin;
    }

    // Method to update the mins and maxes of the polygon
    updateMinMax(point:number[] = this.currentPoint):void {
        if(point[0] < this.xMin) {this.xMin = point[0];}
        if(point[0] > this.xMax) {this.xMax = point[0];}
        if(point[1] < this.yMin) {this.yMin = point[1];}
        if(point[1] > this.yMax) {this.yMax = point[1];}
    }

    // Method to reset mins and maxes of polygons to the starting point if it exists
    resetMinMax():void {
        if(this.startingPoint[0] != null && this.startingPoint[1] != null) {
            // Setting the mins and maxes as the starting point
            this.xMin = this.startingPoint[0];
            this.xMax = this.startingPoint[0];
            this.yMin = this.startingPoint[1];
            this.yMax = this.startingPoint[1];
        }
    }

    // Method to get angle between two vectors (each with two elements)
    vectorAngle(v1:number[], v2:number[]):number {
        // Getting necessary values
        const v1Mag:number = Math.sqrt(v1[0]*v1[0] + v1[1]*v1[1]);
        const v2Mag:number = Math.sqrt(v2[0]*v2[0] + v2[1]*v2[1]);
        const sign:number = v1[0]*v2[1] - v1[1]*v2[0] < 0 ? -1 : 1;
        const dot:number = v1[0]*v2[0] + v1[1]*v2[1];

        return sign * Math.acos(dot / (v1Mag * v2Mag));
    }

    // Method to convert from center to endpoint for elliptical arc
    centerToEndpoint(cx:number, cy:number, rx:number, ry:number, phi:number, theta:number, dTheta:number):number[] {
        // Values we need to obtain
        let x1:number, y1:number, x2:number, y2:number, fA:number, fS:number;

        // Getting values for sin/cos of angles (theta2 = theta + dTheta)
        const sinPhi:number = Math.sin(phi*Math.PI/180), cosPhi:number = Math.cos(phi*Math.PI/180);
        const sinTheta:number = Math.sin(theta*Math.PI/180), cosTheta:number = Math.cos(theta*Math.PI/180);
        const sinTheta2:number = Math.sin((theta+dTheta)*Math.PI/180), cosTheta2:number = Math.cos((theta+dTheta)*Math.PI/180);

        // Getting endpoint values
        x1 = (cosPhi*rx*cosTheta) - (sinPhi*ry*sinTheta) + cx;
        y1 = (sinPhi*rx*cosTheta) + (cosPhi*ry*sinTheta) + cy;
        x2 = (cosPhi*rx*cosTheta2) - (sinPhi*ry*sinTheta2) + cx;
        y2 = (sinPhi*rx*cosTheta2) + (cosPhi*ry*sinTheta2) + cy;
        fA = Math.abs(dTheta * Math.PI/180) > 180 ? 1 : 0;
        fS = dTheta > 0 ? 1 : 0;

        return [x1, y1, x2, y2, fA, fS];
    }

    // Method to convert endpoint to center for elliptical arc
    endpointToCenter(x1:number, y1:number, x2:number, y2:number, rx:number, ry:number, phi:number, fA:number, fS:number):number[] {
        // Values we need to obtain
        let cx:number, cy:number, theta:number, dTheta:number;

        // Getting values for sin/cos of angles (theta2 = theta + dTheta)
        const sinPhi:number = Math.sin(phi*Math.PI/180), cosPhi:number = Math.cos(phi*Math.PI/180);
        
        // Step 1: getting (x1', y1')
        const x1Prime:number = cosPhi*((x1-x2)/2) + sinPhi*((y1-y2)/2);
        const y1Prime:number = -sinPhi*((x1-x2)/2) + cosPhi*((y1-y2)/2);
        
        // Step 2: getting (cx', cy')
        let rxSquared:number = rx*rx, rySquared:number = ry*ry; 
        const x1PrimeSquared = x1Prime*x1Prime, y1PrimeSquared:number = y1Prime*y1Prime;
        const alpha:number = (x1PrimeSquared/rxSquared) + (y1PrimeSquared/rySquared);
        
        // Making sure radii are valid
        if(alpha > 1) {
            rx = Math.sqrt(alpha)*Math.abs(rx);
            ry = Math.sqrt(alpha)*Math.abs(ry);
            rxSquared = rx*rx; rySquared = ry*ry; 
        }
        
        else {
            rx = Math.abs(rx);
            ry = Math.abs(ry);
        }
       
        const sign:number = fA == fS ? -1 : 1;
        const scalarValue:number = sign * Math.sqrt( 
            ((rxSquared*rySquared) - (rxSquared*y1PrimeSquared) - (rySquared*x1PrimeSquared)) / 
            ((rxSquared*y1PrimeSquared) + (rySquared*x1PrimeSquared)) 
        );
        const cxPrime:number = scalarValue*((rx*y1Prime)/ry);
        const cyPrime:number = scalarValue*(-(ry*x1Prime)/rx);

        // Step 3: getting (cx, cy)
        cx = (cosPhi*cxPrime) - (sinPhi*cyPrime) + ((x1+x2)/2);
        cy = (sinPhi*cxPrime) + (cosPhi*cyPrime) + ((y1+y2)/2);

        // Step 4: getting theta and dTheta
        theta = (this.vectorAngle([1, 0], [(x1Prime-cxPrime)/rx, (y1Prime-cyPrime)/ry])) * 180 / Math.PI;
        dTheta = ((this.vectorAngle([(x1Prime-cxPrime)/rx, (y1Prime-cyPrime)/ry], [(-x1Prime-cxPrime)/rx, (-y1Prime-cyPrime)/ry])) * 180 / Math.PI) % 360;

        // Updating dTheta depending on sweep parameter
        if(fS == 0 && dTheta > 0) {dTheta -= 360;}
        if(fS == 1 && dTheta < 0) {dTheta += 360;}

        return [cx, cy, theta, dTheta];
    }

    // Method to return (x,y) of given theta for an arc
    pointsAtTheta(cx:number, cy:number, rx:number, ry:number, phi:number, theta:number):number[] {
        const x:number = cx + (Math.cos(phi*Math.PI/180) * rx * Math.cos(theta*Math.PI/180)) - 
        (Math.sin(phi**Math.PI/180) * ry * Math.sin(theta*Math.PI/180));
        const y:number = cy + (Math.sin(phi*Math.PI/180) * rx * Math.cos(theta*Math.PI/180)) + 
        (Math.cos(phi*Math.PI/180) * ry * Math.sin(theta*Math.PI/180));
        return [x, y];
    }

    // Method to get mins/maxes for Arc command
    arcMinMax(x1:number, y1:number, rx:number, ry:number, phi:number, largeArcFlag:number, sweepFlag:number, x2:number, y2:number):void {
        // Getting the center paramaterization
        const conversionResult:number[] = this.endpointToCenter(x1, y1, x2, y2, rx, ry, phi, largeArcFlag, sweepFlag);
        let cx:number = conversionResult[0], cy:number = conversionResult[1], 
        theta:number = conversionResult[2], dTheta = conversionResult[3], theta2:number = theta + dTheta;

        let critThetaX:number = Math.atan(-Math.tan(phi*Math.PI/180)*ry/rx)*180/Math.PI;
        let critThetaY:number = Math.atan(ry/(rx*Math.tan(phi*Math.PI/180)))*180/Math.PI;

        // Updating mins/maxes if possible for x and y
        let currentResult:number[];
        if(critThetaX >= theta && critThetaX <= theta2) {
            currentResult = this.pointsAtTheta(cx, cy, rx, ry, phi, critThetaX);
            if(currentResult[0] > this.xMax) {this.xMax = currentResult[0];}
            if(currentResult[0] < this.xMin) {this.xMin = currentResult[0];}
        }
        if(critThetaY >= theta && critThetaY <= theta2) {
            currentResult = this.pointsAtTheta(cx, cy, rx, ry, phi, critThetaY);
            if(currentResult[1] > this.yMax) {this.yMax = currentResult[1];}
            if(currentResult[1] < this.yMin) {this.yMin = currentResult[1];}
        }
    }

    // M 371.96484 266.07422 A 243.65184 116.59413 50 0 0 129.83789 370.70898 z 

    // Method to parse the given array of commands
    parsePath(pathArray:string[]):void {
        let currentChar:string;
        let nextChars:string[] = [];
        let nextPoint:number[] = [];
        let diffPoints:number[] = [];


        // Ignoring the first M/m command and value as well as final Z command
        for(let i:number = 0; i < pathArray.length - 1; ++i) {
            currentChar = pathArray[i];
            nextPoint = [];
            diffPoints = [];
            nextChars = [];

            // Getting the next numbers to go with this command
            for(let j:number = i+1; "MmLlHhVvAaCcZz".indexOf(pathArray[j]) == -1; ++j) {nextChars = nextChars.concat(pathArray[j].split(","));}
            
            // Adding the next optimized command to scalablePath based on currentChar
            switch(currentChar) {
                case "M":
                    // Looping for implicit commands (implicit for M are L)
                    for(let j:number = 0; j < Math.floor(nextChars.length/2); ++j) {
                        nextPoint = [Number(nextChars[0+(j*2)]), Number(nextChars[1+(j*2)])];
                        // First command (need it to be absolute)
                        if(i == 0 && j == 0) {
                            this.scalablePath.push("M");
                            this.startingPoint.push(Number(nextChars[0]), Number(nextChars[1]));
                            this.scalablePath.push(nextPoint[0].toString(), nextPoint[1].toString());
                            this.resetMinMax();
                        }
                        else {
                            if(j > 0) {this.scalablePath.push("l");}
                            else {this.scalablePath.push("m");}
                            diffPoints = [nextPoint[0]-this.currentPoint[0], nextPoint[1]-this.currentPoint[1]];
                            this.scalablePath.push(diffPoints[0].toString(), diffPoints[1].toString());
                        }
                        
                        // Updating current point and mins/maxes
                        this.currentPoint = nextPoint;
                        this.updateMinMax();
                    }
                    break;
                case "m":
                    // Looping for implicit commands (implicit for m are l)
                    for(let j:number = 0; j < Math.floor(nextChars.length/2); ++j) {
                        // First command
                        if(i == 0 && j == 0) {
                            // Need to start polygon with absolute M
                            this.scalablePath.push("M");
                            // Starting polygon with a relative m  
                            if(this.prevPolygonPoint.length == 0) {this.startingPoint.push(Number(nextChars[0]), Number(nextChars[1]));}
                            // Relative m with a previous polygon
                            else {this.startingPoint.push(this.prevPolygonPoint[0] + Number(nextChars[0]), this.prevPolygonPoint[1] + Number(nextChars[1]));}
                            nextPoint = this.startingPoint;
                            this.scalablePath.push(nextPoint[0].toString(), nextPoint[1].toString());
                            this.resetMinMax();
                        }
                        else {
                            if(j > 0) {this.scalablePath.push("l");}
                            else {this.scalablePath.push("m");}

                            nextPoint = [this.currentPoint[0] + Number(nextChars[0+(j*2)]), this.currentPoint[1] + Number(nextChars[1+(j*2)])];
                            diffPoints = [nextPoint[0]-this.currentPoint[0], nextPoint[1]-this.currentPoint[1]];
                            this.scalablePath.push(diffPoints[0].toString(), diffPoints[1].toString());
                        }

                        // Updating current point and mins/maxes
                        this.currentPoint = nextPoint;
                        this.updateMinMax();
                    }
                    break;
                case "L":
                    // Looping for implicit commands (implicit for L are L)
                    for(let j:number = 0; j < Math.floor(nextChars.length/2); ++j) {
                        nextPoint = [Number(nextChars[0+(j*2)]), Number(nextChars[1+(j*2)])];
                        diffPoints = [nextPoint[0]-this.currentPoint[0], nextPoint[1]-this.currentPoint[1]];
                        this.scalablePath.push("l", diffPoints[0].toString(), diffPoints[1].toString());

                        // Updating current point and mins/maxes
                        this.currentPoint = nextPoint;
                        this.updateMinMax();
                    }
                    break;
                case "l":
                    // Looping for implicit commands (implicit for l are l)
                    for(let j:number = 0; j < Math.floor(nextChars.length/2); ++j) {
                        nextPoint = [this.currentPoint[0] + Number(nextChars[0+(j*2)]), this.currentPoint[1] + Number(nextChars[1+(j*2)])];
                        diffPoints = [nextPoint[0]-this.currentPoint[0], nextPoint[1]-this.currentPoint[1]];
                        this.scalablePath.push("l", diffPoints[0].toString(), diffPoints[1].toString());

                        // Updating current point and mins/maxes
                        this.currentPoint = nextPoint;
                        this.updateMinMax();
                    }
                    break;
                case "H":
                    // Looping for implicit commands (implicit for H are H)
                    for(let j:number = 0; j < Math.floor(nextChars.length/1); ++j) {
                        // Getting nextpoint and difference from current
                        nextPoint = [Number(nextChars[j]), this.currentPoint[1]];
                        diffPoints = [nextPoint[0]-this.currentPoint[0], 0];
                        this.scalablePath.push("h", diffPoints[0].toString());

                        // Updating current point and mins/maxes
                        this.currentPoint = nextPoint;
                        this.updateMinMax();
                    }
                    break;
                case "h":
                    // Looping for implicit commands (implicit for H are H)
                    for(let j:number = 0; j < Math.floor(nextChars.length/1); ++j) {
                        // Getting nextpoint and difference from current
                        nextPoint = [this.currentPoint[0] + Number(nextChars[j]), this.currentPoint[1]];
                        diffPoints = [nextPoint[0]-this.currentPoint[0], 0];
                        this.scalablePath.push("h", diffPoints[0].toString());

                        // Updating current point and mins/maxes
                        this.currentPoint = nextPoint;
                        this.updateMinMax();
                    }
                    break;
                case "V":
                    // Looping for implicit commands (implicit for V are V)
                    for(let j:number = 0; j < Math.floor(nextChars.length/1); ++j) {
                        // Getting nextpoint and difference from current
                        nextPoint = [this.currentPoint[0], Number(nextChars[j])];
                        diffPoints = [0, nextPoint[1]-this.currentPoint[1]];
                        this.scalablePath.push("v", diffPoints[1].toString());

                        // Updating current point and mins/maxes
                        this.currentPoint = nextPoint;
                        this.updateMinMax();
                    }
                    break;
                case "v":
                    // Looping for implicit commands (implicit for v are v)
                    for(let j:number = 0; j < Math.floor(nextChars.length/1); ++j) {
                        // Getting nextpoint and difference from current
                        nextPoint = [this.currentPoint[0], this.currentPoint[1] + Number(nextChars[j])];
                        diffPoints = [0, nextPoint[1]-this.currentPoint[1]];
                        this.scalablePath.push("v", diffPoints[1].toString());

                        // Updating current point and mins/maxes
                        this.currentPoint = nextPoint;
                        this.updateMinMax();
                    }
                    break;
                case "C":
                    // Looping for implicit commands
                    for(let j:number = 0; j < Math.floor(nextChars.length/6); ++j) {
                        nextPoint = [Number(nextChars[4+(j*6)]), Number(nextChars[5+(j*6)])];
                        this.scalablePath.push("c");
                        for(let i:number = 0; i < 6; ++i) {
                            diffPoints.push(Number(nextChars[i+(j*6)]) - this.currentPoint[i%2]);
                            this.scalablePath.push(diffPoints[i+(j*6)].toString());
                        }
                        this.currentPoint = nextPoint;
                        this.updateMinMax();
                    }
                    break;
                case "c":
                    // Looping for implicit commands
                    for(let j:number = 0; j < Math.floor(nextChars.length/6); ++j) {
                        nextPoint = [this.currentPoint[0] + Number(nextChars[4+(j*6)]), this.currentPoint[1] + Number(nextChars[5+(j*6)])];
                        this.scalablePath.push("c");
                        for(let i:number = 0; i < 6; ++i) {
                            diffPoints.push(Number(nextChars[i+(j*6)]));
                            this.scalablePath.push(diffPoints[i+(j*6)].toString());
                        }
                        this.currentPoint = nextPoint;
                        this.updateMinMax();
                    }
                    break;
                // S/s will be added later (adds onto C/c)
                case "S":
                    break;
                case "s":
                    break;
                case "Q":
                    nextPoint = [Number(nextChars[2]), Number(nextChars[3])];
                    this.scalablePath.push("q");
                    for(let j:number = 0; j < nextChars.length; ++j) {
                        diffPoints.push(Number(nextChars[j]) - this.currentPoint[j%2]);
                        this.scalablePath.push(diffPoints[j].toString());
                    }
                    break;
                case "q":
                    nextPoint = [this.currentPoint[0] + Number(nextChars[2]), this.currentPoint[1] + Number(nextChars[3])];
                    this.scalablePath.push("q");
                    for(let j:number = 0; j < nextChars.length; ++j) {
                        diffPoints.push(Number(nextChars[j]));
                        this.scalablePath.push(diffPoints[j].toString());
                    }
                    break;
                // T/t will be added later (adds onto Q/q)
                case "T":
                    break;
                case "t":
                    break;
                case "A":
                    // Looping for implicit commands
                    for(let j:number = 0; j < Math.floor(nextChars.length/7); ++j) {
                        nextPoint = [Number(nextChars[5+(j*7)]), Number(nextChars[6+(j*7)])];
                        this.scalablePath.push("a");
                        diffPoints = [nextPoint[0]-this.currentPoint[0], nextPoint[1]-this.currentPoint[1]];
                        for(let k:number = 0; k < 5; ++k) {
                            this.scalablePath.push(nextChars[k+(j*7)]);
                        }
                        this.scalablePath.push(diffPoints[0].toString(), diffPoints[1].toString());
                        // Updating current point and mins/maxes
                        this.arcMinMax(this.currentPoint[0], this.currentPoint[1], Number(nextChars[0+(j*7)]), 
                            Number(nextChars[1+(j*7)]), Number(nextChars[2+(j*7)]), Number(nextChars[3+(j*7)]),
                            Number(nextChars[4+(j*7)]), nextPoint[0], nextPoint[1]
                        );
                        this.currentPoint = nextPoint;
                        this.updateMinMax();
                    }
                    break;
                case "a":
                    // Looping for implicit commands
                    for(let j:number = 0; j < Math.floor(nextChars.length/7); ++j) {
                        nextPoint = [this.currentPoint[0]+Number(nextChars[5+(j*7)]), this.currentPoint[1]+Number(nextChars[6+(j*7)])];
                        this.scalablePath.push("a");
                        diffPoints = [nextPoint[0]-this.currentPoint[0], nextPoint[1]-this.currentPoint[1]];
                        for(let k:number = 0; k < 5; ++k) {
                            this.scalablePath.push(nextChars[k+(j*7)]);
                        }
                        this.scalablePath.push(diffPoints[0].toString(), diffPoints[1].toString());
                        // Updating current point and mins/maxes
                        this.arcMinMax(this.currentPoint[0], this.currentPoint[1], Number(nextChars[0+(j*7)]), 
                            Number(nextChars[1+(j*7)]), Number(nextChars[2+(j*7)]), Number(nextChars[3+(j*7)]),
                            Number(nextChars[4+(j*7)]), nextPoint[0], nextPoint[1]
                        );
                        this.currentPoint = nextPoint;
                        this.updateMinMax();
                    }
                    break;
                default:
                    continue;    
            }

            // Updating current point and mins/maxes
            this.currentPoint = nextPoint;
            this.updateMinMax();
        }

        // Adding final ending to scalable polygon path
        this.scalablePath.push("Z");
    }

    // Method to return outset polygon
    outset(xOutset:number, yOutset:number):string {
        let scaleX:number = (this.polygonWidth+(xOutset*2))/this.polygonWidth;
        let scaleY:number = (this.polygonHeight+(yOutset*2))/this.polygonHeight;
        let centerPoint:number[] = [this.polygonWidth/2 + this.xMin, this.polygonHeight/2 + this.yMin];
        let scaledPath:string[] = this.scalablePath.slice();
        let differenceFromCenter:number[] = [Number(scaledPath[1])-centerPoint[0], Number(scaledPath[2])-centerPoint[1]];

        // Changing starting point to be scaled now
        scaledPath[1] = (centerPoint[0] + (differenceFromCenter[0]*(scaleX))).toString();
        scaledPath[2] = (centerPoint[1] + (differenceFromCenter[1]*scaleY)).toString();
        this.currentPoint = [Number(scaledPath[1]), Number(scaledPath[2])];
        let nextPoint:number[];
        let diffPoints:number[];
        let nextChars:string[];
        for(let i:number = 3; i < scaledPath.length - 1; ++i) {
            nextPoint = []; diffPoints = []; nextChars = [];
            // Getting the next numbers to go with this command
            for(let j:number = i+1; "MmLlHhVvAaCcZz".indexOf(scaledPath[j]) == -1; ++j) {nextChars = nextChars.concat(scaledPath[j].split(","));}
            switch(scaledPath[i]) {
                case "m":
                case "l":
                    nextPoint = [this.currentPoint[0] + (Number(nextChars[0])*scaleX), this.currentPoint[1] + (Number(nextChars[1])*scaleY)];
                    diffPoints = [nextPoint[0]-this.currentPoint[0], nextPoint[1]-this.currentPoint[1]];
                    // Updating with new scaled values
                    for(let k:number = 0; k < diffPoints.length; ++k) {scaledPath[i+(k+1)] = diffPoints[k].toString();}
                    break;
                case "h":
                    nextPoint = [this.currentPoint[0] + (Number(nextChars[0])*scaleX), this.currentPoint[1]];
                    diffPoints = [nextPoint[0]-this.currentPoint[0], 0];
                    // Updating with new scaled values
                    scaledPath[i+1] = diffPoints[0].toString();
                    break;
                case "v":
                    nextPoint = [this.currentPoint[0], this.currentPoint[1] + (Number(nextChars[0])*scaleY)];
                    diffPoints = [0, nextPoint[1]-this.currentPoint[1]];
                    // Updating with new scaled values
                    scaledPath[i+1] = diffPoints[1].toString();
                    break;
                case "c":
                    nextPoint = [this.currentPoint[0] + (Number(nextChars[4])*scaleX), this.currentPoint[1] + (Number(nextChars[5])*scaleY)];
                    for(let k:number = 0; k < nextChars.length; ++k) {
                        if(k % 2 == 0) {diffPoints.push(Number(nextChars[k])*scaleX);}
                        else {diffPoints.push(Number(nextChars[k])*scaleY);}
                        scaledPath[i+(k+1)] = diffPoints[k].toString();
                    }
                    break;
                // s will be added later (adds onto c)
                case "s":
                    break;
                case "q":
                    nextPoint = [this.currentPoint[0] + (Number(nextChars[2])*scaleX), this.currentPoint[1] + (Number(nextChars[3])*scaleY)];
                    for(let k:number = 0; k < nextChars.length; ++k) {
                        if(k % 2 == 0) {diffPoints.push(Number(nextChars[k])*scaleX);}
                        else {diffPoints.push(Number(nextChars[k])*scaleY);}
                        scaledPath[i+(k+1)] = diffPoints[k].toString();
                    }
                    break;
                // t will be added later (adds onto q)
                case "t":
                    break;
                case "a":
                    nextPoint = [this.currentPoint[0] + (Number(nextChars[5])*scaleX), this.currentPoint[1] + (Number(nextChars[6])*scaleY)];
                    for(let k:number = 0; k < nextChars.length; ++k) {
                        // Keep same angle, sweep flag, etc.
                        if(k >= 2 && k <= 4) {diffPoints.push(Number(nextChars[k]));}
                        else if(k % 2 == 0) {diffPoints.push(Number(nextChars[k])*scaleX);}
                        else {diffPoints.push(Number(nextChars[k])*scaleY);}
                        scaledPath[i+(k+1)] = diffPoints[k].toString();
                    }
                    break;
                default:
                    continue;
            }
            // Updating current point
            this.currentPoint = nextPoint;
        }
        return scaledPath.join(" ").trim();
    }

    // Method to return scalable path
    getScalablePath():string {return this.scalablePath.join(" ");}
}

// Class for an SVG design template
export class SVGTemplate {
    /* 
    Parameters: 
        string: path of svg template
    Attributes:
        polygonPaths:string[] --> holds each subPolygon path
        startingPoint:number[] --> holds starting point of template in absolute coordinates
        {x/y}{minMax}:number --> holds the min/max point on x/y for this polygon
        width:number --> width of template
        height:number --> height of template
        outerEdgeIndex:number --> holds the location of the template perimeter
        subShapes:Polygon[] --> holds each subPolygon
    Methods:
        getOptimizedD:string() --> returns the optimized d attribute for the template
    */
    polygonPaths:string[];
    startingPoint:number[];

    // Values for max/min in x/y
    xMin:number;
    xMax:number;
    yMin:number;
    yMax:number;
    numberRotations:number;
    flipped:boolean;

    width:number;
    height:number;

    outerEdgeIndex:number;
    autofillString:string;

    // Array to hold the polygons making up the template
    subShapes:Polygon[];

    // Basic constructor which takes d attribute (string)
    constructor(svgPath:string) {
        this.polygonPaths = svgPath.trim().split("z").join("z; ").split("Z").join("Z; ").split("; ");
        this.subShapes = [];
        
        // Looping through subshapes to add each subpolygon to the polygon array
        for(let i:number = 0; i < this.polygonPaths.length; ++i) {
            if(this.polygonPaths[i].length == 0) {continue;}
            if(i > 0) {this.subShapes.push(new Polygon(this.polygonPaths[i].trim(), this.subShapes[i-1].startingPoint));}
            else {this.subShapes.push(new Polygon(this.polygonPaths[i].trim()));}
            
            
            // Updating mins and maxes
            if(i === 0 || this.subShapes[i].xMin < this.xMin) {this.xMin = this.subShapes[i].xMin;}
            if(i === 0 || this.subShapes[i].xMax > this.xMax) {this.xMax = this.subShapes[i].xMax;}
            if(i === 0 || this.subShapes[i].yMin < this.yMin) {this.yMin = this.subShapes[i].yMin;}
            if(i === 0 || this.subShapes[i].yMax > this.yMax) {this.yMax = this.subShapes[i].yMax;}
        }

        // Getting starting point for template
        this.startingPoint = this.subShapes[0].startingPoint;
        this.width = this.xMax - this.xMin;
        this.height = this.yMax - this.yMin;
        this.numberRotations = 0;
        this.flipped = false;

        this.outerEdgeIndex = 0;
        // Identifying outer edge of template (rest is the panes)
        for(let i:number = 0; i < this.subShapes.length; ++i) {
            if(this.subShapes[i].polygonWidth == this.width && this.subShapes[i].polygonHeight == this.height) {this.outerEdgeIndex = i;}
        }
    }

    // Method to access the templates' optimized svg d attribute
    getOptimizedD():string {
        let optimizedD:string = "";
        for(let i:number = 0; i < this.subShapes.length; ++i) {optimizedD += this.subShapes[i].getScalablePath() + " ";}
        return optimizedD.trim();
    }

    /*
    Equations to get xOutset and newScale:
    newScaleX = scaleX*width / (width - 2xOutset)
    (railWidth - 2xOutset)*newScaleX = railWidth
    */
    // Method to get a scaled version of the template --> returns [scaledD, newScaleX, newScaleY]
    getScaledD(scaleX:number, scaleY:number):string[] {
        let scaledD:string = "";
        // Getting outset values for reducing wallwidth in x/y
        let xOutset:number = (3*this.width*(scaleX-1)) / (scaleX*this.width - 6);
        let yOutset:number = (3*this.height*(scaleY-1)) / (scaleY*this.height - 6);
        

        // Getting new scale values
        let newScaleX:number = (scaleX*this.width) / (this.width - (2*xOutset));
        let newScaleY:number = (scaleY*this.height) / (this.height - (2*yOutset));
        
        // Looping through and outsetting each polygon by a certain value
        for(let i:number = 0; i < this.subShapes.length; ++i) {
            if(i == this.outerEdgeIndex) {scaledD += this.subShapes[i].outset(-xOutset, -yOutset) + " ";}
            else {scaledD += this.subShapes[i].outset(xOutset, yOutset) + " ";}
        }
        return [scaledD.trim(), newScaleX.toString(), newScaleY.toString()];
    }

    /*
   /*
    Equations to get xOutset and newScale (different for panes):
    newScaleX = (scaleX*width-2paneOffset) / (width - 2xOutset)
    (railWidth - 2xOutset)*newScaleX = railWidth - 2paneTolerance
    */
    // Method to get panes for laser cutting
    getLaserCutPanes(scaleX:number=1, scaleY:number=1):string[] {
        let result:string = "";
        // Getting outset values for reducing wallwidth in x/y
        // let xOutset:number = (3*this.width*(scaleX-1)) / (scaleX*this.width - 6);
        // let yOutset:number = (3*this.height*(scaleY-1)) / (scaleY*this.height - 6);

        // // Getting new scale values
        // let newScaleX:number = (scaleX*this.width) / (this.width - (2*xOutset));
        // let newScaleY:number = (scaleY*this.height) / (this.height - (2*yOutset));
        let xOutset:number = (3.5*this.width - 6*(scaleX*this.width-2.5)) / (7 - 2*(scaleX*this.width-2.5));
        let yOutset:number = (3.5*this.height - 6*(scaleY*this.height-2.5)) / (7 - 2*(scaleY*this.height-2.5));

        // Getting new scale values
        let newScaleX:number = 3.5 / (6 - (2 * xOutset));
        let newScaleY:number = 3.5 / (6 - (2 * yOutset));

        // Looping through each pane and outsetting by 2mm so pane will fit in aperture
        for(let i:number = 0; i < this.subShapes.length; ++i) {if(i != this.outerEdgeIndex) {result += this.subShapes[i].outset(xOutset, yOutset) + " ";}}
        return [result.trim(), newScaleX.toString(), newScaleY.toString()];
    }

    getFileText(scaleX:number, scaleY:number):string {
        //
        let scaledDInfo:string[] = this.getScaledD(scaleX, scaleY);
        let paths:string = `\n
            <path
                id="rect569"
                style="fill:#ececec;stroke-width:0.999999"
                d="` + scaledDInfo[0] + `"
                transform="scale(` + scaledDInfo[1] + `, ` + scaledDInfo[2] + `)" /> \n
            `;

        let svgSizeInfo:string = "\nwidth='"+(this.width*scaleX)+"mm'\n" +
            "height='"+(this.height*scaleY)+"mm'\n" +
            "viewBox='"+0 + " " + 0 + " " + (this.width*scaleX) + " " + (this.height*scaleY) + "'\n";
        
        let fullFileText:string = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
xmlns:dc="http://purl.org/dc/elements/1.1/"
xmlns:cc="http://creativecommons.org/ns#"
xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
xmlns:svg="http://www.w3.org/2000/svg"
xmlns="http://www.w3.org/2000/svg"` + 
svgSizeInfo +
`
version="1.1"
id="svg567">
<defs
    id="defs561" />
<metadata
    id="metadata564">
    <rdf:RDF>
    <cc:Work
        rdf:about="">
        <dc:format>image/svg+xml</dc:format>
        <dc:type
        rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
        <dc:title></dc:title>
    </cc:Work>
    </rdf:RDF>
</metadata>
<g
    id="layer1">
    ` + 
    paths + 
`     
</g>
</svg>
`
        return fullFileText;
    }

    getTransform():string {
        const rotationAmount:number = this.numberRotations * 90;
        const flipNumber:number = this.flipped ? -1 : 1;
        const centerX:number = this.xMin + (this.width/2);
        const centerY:number = this.yMin + (this.height/2);
        return "rotate(" + rotationAmount + ", " + centerX + ", " + centerY + ") scale(" + flipNumber + ",1) " + (this.flipped ? " translate(" + (-2*centerX) + ", 0)" : "");
    }
}

let p:string = "m 0,0 0,1062.9922 1062.9922,0 0,-1062.9922 z m 17.716797,17.716797 752.742183,0 c -14.15377,7.87015 -29.46756,15.79146 -106.61328,26.400391 L 470.57422,59.347656 C 412.50971,54.804892 307.55469,93.073523 185.39258,147.05469 124.20391,125.76288 118.33962,155.98031 138.125,210.07812 93.35081,339.69209 124.27338,342.51421 133.39844,363.95898 79.996515,439.91079 75.718374,488.76004 103.46289,519.94141 l -85.746093,-0.52539 z m 792.132813,0 235.42579,0 0,478.066403 C 995.78643,468.73143 957.87434,423.15679 922.24023,373.9375 1067.728,277.74607 906.85042,193.64876 860.26758,105.03906 Z m -16.42188,15.189453 53.5586,95.07031 c 25.04744,31.40464 52.33282,61.03169 78.32422,91.66602 12.62092,18.45816 25.08519,37.58557 31.66992,59.14453 7.03322,18.69348 -1.13698,39.8673 -14.84961,53.47266 -9.2471,5.98231 -17.80073,13.16513 -27.16406,19.04687 -5.48647,4.29091 -12.3979,4.71555 -19.08008,4.41602 -16.00566,5.94553 -30.15479,15.93838 -44.32227,25.31445 -12.24224,6.81702 -22.37028,17.30473 -35.66211,22.1582 -11.20189,2.73944 -24.37418,0.0782 -32.99609,-7.84961 -3.6816,-10.18847 3.04864,-20.58589 1.49219,-31.13476 -8.34951,-28.90541 -16.57818,-57.98147 -26.91992,-86.29297 -7.11831,-22.10035 -20.43447,-41.32249 -32.69922,-60.79883 -16.76563,-24.28975 -31.769,-51.05779 -56.27344,-68.57226 -15.85847,-12.40747 -35.52458,-17.63519 -54.49414,-23.15821 -16.84396,-6.03212 -34.15598,1.30223 -50.82813,3.17383 -8.63713,1.60853 -17.62947,-0.85936 -23.90039,-7.08594 -15.51495,-15.45049 -32.10818,-31.028211 -52.68164,-39.740232 18.72891,-1.558584 37.3897,-3.918441 56.05274,-5.996094 45.18556,-6.105446 90.74942,-7.239569 136.30078,-9.111328 32.86694,-6.854027 65.21145,-16.315777 97.73828,-24.642578 z M 431.39648,92.216797 c 23.13169,-0.308109 46.56147,7.250833 65.55079,20.675783 20.99607,16.23424 39.64754,35.27834 57.69335,54.66406 42.74699,47.17259 78.28285,104.19754 88.75977,167.85547 4.12595,20.3732 -1.19984,41.13779 -10.10351,59.76953 -12.02807,26.16292 -29.13174,51.26009 -32.88086,80.45898 -2.40086,14.37846 9.01383,27.78677 3.69726,41.90626 -11.70627,18.95474 -34.12725,26.98608 -54.47266,32.92968 -19.36729,4.72697 -38.09263,11.82116 -57.17773,17.29297 -27.91467,6.38416 -58.32604,9.00929 -85.58789,-0.86133 -11.20868,-3.18248 -22.87486,-13.80003 -19.85156,-26.42773 49.18188,-23.27184 102.2758,-38.19246 151.13867,-62.55469 11.27663,-6.51426 24.55765,-11.11627 32.80859,-21.70312 10.59995,-18.3963 12.61657,-40.24674 14.41016,-61.01368 1.18985,-24.39744 3.5447,-49.31462 -1.61328,-73.43164 -9.62691,-36.64959 -36.94004,-65.33194 -65.3711,-88.86718 -6.3141,-7.84831 -17.17801,-6.4349 -25.61718,-9.8711 -7.09593,-7.98405 -11.82514,-17.87505 -18.48047,-26.26953 -12.84696,-19.08628 -35.63739,-27.96374 -57.42969,-31.93359 -16.27378,-2.37059 -33.52858,-6.1015 -49.66211,-0.8711 -32.08051,14.6846 -61.9977,33.77279 -90.69531,54.21485 4.41993,-14.9116 8.79091,-29.81288 14.24219,-44.4043 8.25466,-20.00871 16.33418,-42.77766 35.4082,-54.90039 33.74452,-13.09403 68.69344,-26.147369 105.23437,-26.658203 z M 290.47852,126.85742 c -1.80299,2.80203 -4.1243,6.39064 -6.7168,9.02344 -11.40658,25.23428 -18.88139,52.09925 -27.00391,78.54492 -2.31146,5.43013 -3.60844,11.08306 -2.99414,17.02344 -4.12714,10.72537 -13.41722,18.97362 -21.50195,27.0918 -16.42242,14.10014 -29.28813,31.57534 -41.27149,49.44921 -10.30976,12.84933 -17.24517,30.0602 -32.89062,37.53516 -6.41258,3.76668 -15.93567,1.86227 -18.11523,-5.97266 -7.99981,-41.68712 9.51449,-81.82462 17.43945,-122.26757 4.19119,-11.77825 -1.91564,-23.70994 -6.98633,-34.11524 -2.7961,-6.22774 -6.96696,-15.95718 -0.14062,-20.87304 14.80978,-1.02575 28.56045,10.23689 43.61328,6.37304 32.19946,-13.8636 62.72363,-31.90065 96.56836,-41.8125 z m 301.61132,19.24024 c 18.73675,0.20534 37.05569,6.43741 53.00586,16.0664 20.50408,11.24763 33.82282,31.10236 45.89063,50.42774 10.2069,16.71657 22.59542,32.00154 32.45898,48.92187 9.59211,25.99291 18.6921,52.2276 28.31055,78.24414 7.9948,15.7528 7.65295,33.79037 6.94141,50.97266 2.37616,20.14034 -3.66334,39.8701 -9.4668,58.9082 -6.3804,1.6243 -12.1955,4.82697 -17.86133,8.08789 -15.20183,13.676 -27.37261,30.42677 -41.02734,45.62696 -14.53377,14.13468 -25.5858,33.67488 -45.52344,41.04101 -4.99968,-6.63999 -8.90684,-14.0353 -12.12305,-21.68164 -5.37758,-15.42974 -12.81437,-31.33472 -11.06054,-48.09375 3.89476,-16.73054 12.71632,-31.85237 20.12109,-47.23047 7.30396,-15.78662 15.46997,-31.19741 22.13867,-47.26367 4.90063,-18.78065 3.19865,-38.63203 0.0293,-57.71875 -12.31782,-65.8853 -51.54252,-123.20157 -95.31641,-172.69727 7.82755,-1.20326 15.65494,-2.4076 23.48242,-3.61132 z m -208.03906,36.99609 c 8.33429,-0.0886 16.58947,0.2681 24.80469,1.41406 23.0134,2.15398 46.62549,14.88786 55.77734,37.10742 -4.60534,0.71098 -9.2248,1.32581 -13.82031,2.09961 -28.03464,3.31139 -51.2003,22.4287 -67.4707,44.43555 -5.15212,5.33533 -7.09023,13.61716 -13.90625,17.1875 -20.87112,8.86689 -44.08623,12.32707 -63.66407,24.42578 -8.42873,5.74146 -18.51477,11.4027 -21.84179,21.70508 -11.18287,37.29967 1.38363,79.55005 27.99219,107.33203 -4.41886,1.59417 -9.41965,2.65772 -14.19336,3.42969 -30.18082,5.34359 -59.63429,-9.82321 -81.86719,-28.94336 -12.1033,-11.76628 -27.8257,-22.68685 -31.87695,-40.08399 1.50424,-12.70683 7.75626,-24.59571 13.79492,-35.80273 34.65944,-59.52219 89.03937,-105.64856 149.06445,-138.17773 12.34195,-5.52676 23.63121,-13.92801 37.20703,-16.12891 z m -116.59356,50.84628 c 2.92755,3.09203 2.85156,3.07355 0,0 z m 212.84942,8.83731 c 10.06405,-0.1137 20.29434,1.91416 27.89844,9.06836 26.28658,20.28357 50.07552,47.43322 55.43945,81.14453 -7.97356,7.71796 -19.09459,13.07718 -29.4707,17.65235 -7.558,-13.23792 -14.74153,-26.72173 -23.25195,-39.38672 -7.07363,-9.37515 -13.09953,-20.50607 -23.6836,-26.39258 -26.63401,-12.49013 -57.55048,-9.0763 -85.23828,-2.15234 4.34402,-5.84513 9.28781,-11.23778 14.67773,-16.13282 16.07597,-16.22049 39.23365,-22.8599 61.61915,-23.75 0.66863,-0.0257 1.33882,-0.0432 2.00976,-0.0508 z m -27.47266,54.85547 c 10.74989,1.04575 22.03507,4.43986 30.14258,12.08203 13.67471,17.87969 24.29173,38.0115 36.69532,56.81836 -21.38705,16.79915 -43.22846,33.11641 -63.1543,51.67188 -4.5462,3.09788 -7.70384,7.86246 -12.11719,11.03515 -0.86469,-2.23091 -0.63261,-5.54124 -2.08789,-7.91601 -6.6452,-10.62784 -11.05405,-23.50029 -21.75391,-30.95117 13.55693,-3.68008 28.16619,-9.23639 39.83985,-18.10743 11.25182,-6.83242 9.39776,-21.41991 12.35937,-32.42382 -1.14058,-15.59426 -7.72046,-31.35564 -19.56054,-41.90039 z m -30.3496,5.28711 c 5.17579,0.64543 9.68268,5.2727 13.93359,8.3711 13.40904,9.65226 18.35381,29.26454 9.65234,43.63281 -14.11323,14.19399 -34.38761,20.2563 -53.63867,23.87305 -5.89262,2.50022 -11.83404,-0.60241 -16.04297,-4.74024 -9.63843,-5.72533 -11.883,-18.50795 -7.17383,-28.14258 7.9156,-22.90331 30.72183,-36.48946 52.79688,-42.86133 z m -52.45508,6.06836 c -13.07086,7.9493 -18.57297,22.67151 -24.55469,36.26172 -5.23115,5.30228 -2.18973,14.82775 0.0762,21.36328 3.05867,16.1452 16.24708,28.96665 31.86328,33.23633 5.94705,2.6676 12.32103,1.49103 18.55469,1.55273 16.30983,6.44238 26.93418,22.34562 33.95313,37.65821 l -18.1504,5.31445 c -10.60348,4.65339 -21.83816,4.40987 -33.10546,3.66016 -9.39202,0.7601 -18.98755,-0.51979 -27.16016,-5.55274 -31.33258,-15.51443 -47.86482,-50.73834 -49.04102,-84.41992 -1.01666,-11.01303 -0.0518,-24.56591 10.46094,-31.08594 17.3066,-7.48568 36.09821,-10.98218 53.9707,-16.97265 z m 194.79882,51.08789 c 0.44878,16.07022 -0.91089,32.19865 -3.46874,48.12695 -3.00299,16.05285 -5.72161,35.08645 -20.23829,45.12891 -60.22518,29.59138 -124.2469,50.26795 -186.08984,76.09961 -11.23882,3.43702 -20.96736,11.11309 -32.73828,12.76953 -17.70334,-0.46746 -33.50226,-10.34412 -48.09961,-19.48437 -20.16957,-14.21459 -41.38938,-27.29248 -59.45703,-44.13282 -20.51825,-20.31565 -40.10336,-46.50599 -37.81836,-76.68945 13.55095,18.11124 29.45361,34.92204 48.91992,46.72266 31.28021,19.84558 72.05633,20.07173 105.46094,5.48047 8.21149,5.75893 17.65044,11.45462 27.96484,13.27929 30.7698,6.94208 60.83804,-6.67804 90.11133,-14.12109 18.10881,-13.67317 34.98667,-29.11207 52.35547,-43.77734 20.55664,-16.56851 39.93372,-34.83961 62.33984,-48.95118 z m -401.88867,6.72852 c -7.7661,25.27667 -13.97771,53.69278 -3.39648,79.11523 8.08543,16.67353 21.21002,30.30912 34.0293,43.45508 33.00727,32.19285 71.22227,61.45836 116.16992,74.30664 16.09612,6.07013 32.92366,-1.58436 47.13867,-9.00391 2.16328,-0.53354 6.19988,-4.26135 7.40039,-3.09765 4.23553,16.89419 19.5368,27.89895 33.93359,36.0293 17.37967,6.24022 36.31512,6.8442 54.63868,6.38085 15.91014,0.43298 31.51553,-3.67651 47.10742,-5.37304 22.94016,0.54609 48.0835,3.66132 66.26367,19.01367 -27.34979,17.26401 -55.1844,34.01712 -84.88477,46.96484 -27.29868,11.36377 -56.38724,22.44703 -86.1914,19.88672 -80.46532,-2.26235 -161.28598,-26.15116 -226.70899,-74.00195 L 118.79102,496.59375 c -2.99937,-8.23895 -8.44148,-15.30045 -10.85352,-23.65625 6.01576,-39.61199 24.82594,-78.04402 54.17578,-105.37695 l 0,-0.002 0.0879,-0.0801 z m 733.17188,13.28906 c 8.68743,8.22154 15.90642,17.92139 23.43164,27.28125 32.22857,38.77318 64.71307,79.01691 107.61523,106.55273 -4.3854,4.35548 -8.5816,8.90389 -12.5371,13.6543 -26.06225,29.42903 -38.45215,71.06375 -30.06837,109.74805 l -160.78125,49.93359 c -44.00127,14.22429 -88.33879,27.54322 -133.34375,38.06836 -19.08826,6.17073 -39.13227,7.1983 -59.03125,7.92969 -16.81171,2.40653 -33.16671,-2.45825 -49.4082,-6.3125 25.38844,-12.20489 51.59679,-22.84153 75.94922,-37.10156 31.71234,-20.56341 63.52475,-41.01281 95.71289,-60.8711 48.44595,-30.95535 98.79385,-60.83309 138.16992,-103.41992 4.79656,-4.51332 11.64284,-11.87844 6.90039,-18.75 -17.49052,-13.55935 -37.67568,-23.47414 -57.6582,-32.91602 -22.10192,-7.86858 -44.99222,-13.53075 -67.35547,-20.69531 2.92193,-9.53822 5.91932,-19.05733 8.50781,-28.69336 7.20215,-1.01485 14.57078,0.48655 21.88868,0.88086 17.43559,2.32054 34.30125,-5.28564 47.93554,-15.58593 15.08324,-9.41704 26.72368,-24.36898 44.07227,-29.70313 z m -143.33594,92.23242 c 2.70025,0.0322 5.41557,0.35059 8.08984,0.67969 38.78198,8.20347 77.25037,20.69326 111.16211,41.62305 -17.24538,19.77363 -38.43318,35.56162 -60.05078,50.20898 -67.77173,43.52037 -133.88745,90.10734 -205.75976,126.80469 -41.89645,19.79688 -84.95949,40.51604 -131.68946,45.07422 -45.78721,3.31948 -89.22937,-15.07517 -130.92773,-31.43164 -9.38736,-2.79879 -20.1238,-6.61946 -24.13672,-16.65039 19.42615,2.51351 38.86895,4.53797 58.45508,5.66601 31.04565,3.30499 61.97491,-3.96812 91.74414,-12.41601 36.38357,-14.52825 71.58119,-32.46371 103.81445,-54.79102 8.4797,-6.37504 19.58405,-16.07662 15.32032,-27.93555 -7.03162,-13.01687 -22.51197,-17.72397 -34.94727,-23.96875 -2.31981,-0.80844 -8.34207,-1.84572 -5.17188,-5.38281 16.75212,-3.27505 33.12968,-9.38588 47.66602,-18.25976 7.77886,-2.75068 11.56537,-10.48138 17.72656,-15.375 6.95919,3.95024 9.17394,12.07338 12.51758,18.74414 3.87809,9.37686 15.46508,12.27065 24.40039,8.63671 29.56341,-11.54009 48.36156,-38.84384 67.79883,-62.41015 9.87129,-9.98192 17.0055,-24.3824 31.29492,-28.74219 0.89456,-0.0627 1.79328,-0.0849 2.69336,-0.0742 z m 292.50001,60.65039 0,512.29884 -145.09376,0 -97.68555,-325.75978 210.07811,-68.27539 c -12.76541,-42.64877 -15.49475,-83.92784 32.7012,-118.26367 z m -1027.558603,9.35742 97.035153,0.3711 37.88086,74.64453 c 36.64604,30.44745 84.74327,48.56193 134.0625,65.36133 5.44474,32.21226 142.01838,106.23259 255.87305,60.16211 48.94231,13.15894 99.69598,22.11405 153.56055,5.38476 l 30.08203,50.87696 c -7.36547,4.14694 -24.978,1.46392 -22.09766,12.4414 l 55.70508,80.77149 12.44141,80.58789 -58.49024,7.98437 64.24609,64.35548 -760.298823,0 z M 781.63086,722.80469 c 7.57128,25.72888 15.14243,51.45641 22.71289,77.18554 25.59256,84.54804 45.44914,161.28932 72.81055,245.28317 l -63.63672,-0.5254 c -19.53115,-19.3009 -34.86571,-29.6674 -54.39649,-48.9687 12.62075,-1.66309 25.24085,-3.33106 37.86133,-4.9961 L 779.80078,884.43359 c -14.47507,-21.83533 -30.04871,-42.91694 -44.53516,-64.74414 8.5435,-1.2895 17.08588,-2.58636 25.62891,-3.8789 -14.72895,-25.04765 -29.45962,-50.0943 -44.1875,-75.14258 21.01016,-5.77917 42.01947,-11.56143 63.0293,-17.3418 l 0.92969,-0.25781 z";

// 1.7A 01
//let p:string = "M -3.1667375,34.1668 V 262.16653 H 214.8334 V 34.1668 Z m 8.0003398,8.000337 H 44.833642 V 206.16692 H 4.8336023 Z m 47.9998267,0 H 101.83316 V 173.16676 l -48.999731,33.00016 v -33.00016 z m 57.000071,0 h 49.00028 V 173.16676 h -5.6e-4 v 33.00016 L 109.8335,173.16676 Z m 57.00007,0 h 40.00004 V 206.16692 h -40.00004 z m -61.00024,137.999503 52.9999,34.00006 v 40.00004 H 52.833429 V 214.1667 Z M 4.8170641,214.1667 H 44.816553 v 40.00004 H 4.8170641 Z m 162.0159559,0 h 40.00004 v 40.00004 h -40.00004 z";

// 1.7A 02
//let p:string = "M -1.6548343,28.119286 V 256.1188 H 216.3453 V 28.119286 Z M 54.345366,36.118797 H 103.34496 V 248.11929 H 54.345366 Z m 56.999614,0 H 160.3451 V 84.177878 117.11902 248.11929 H 111.34498 V 117.11902 Z M 6.3451957,36.119326 H 46.345346 V 248.11929 H 6.3451957 Z m 161.9999243,0 h 40.00015 V 248.11929 h -40.00015 z";

// 1.7A 03
//let p:string = "M -11.96875 129.13477 L -11.96875 990.86523 L 811.96875 990.86523 L 811.96875 129.13477 L -11.96875 129.13477 z M 199.68555 159.36914 L 600.31445 159.36914 L 600.31445 310.55078 L 600.31445 310.55273 L 400 439.05664 L 199.68555 310.55273 L 199.68555 310.55078 L 199.68555 159.36914 z M 630.55273 159.36914 L 781.73242 159.36914 L 781.73242 960.63086 L 630.55273 960.63086 L 630.55273 159.36914 z M 18.261719 159.45508 L 169.44336 159.45508 L 169.44336 960.71289 L 18.261719 960.71289 L 18.261719 159.45508 z M 199.68555 341.01172 L 384.88086 465.51172 L 384.88086 465.51367 L 384.88086 960.62891 L 199.68555 960.62891 L 199.68555 465.51367 L 199.68555 465.51172 L 199.68555 341.01172 z M 600.31445 341.01172 L 600.31445 465.51172 L 600.31445 465.51367 L 600.31445 960.62891 L 415.11914 960.62891 L 415.11914 465.51367 L 415.11914 465.51172 L 600.31445 341.01172 z";

// 1.7A 04
//let p:string = "M -3.1667317,34.166907 V 262.16642 H 214.8334 V 34.166907 Z M 52.833467,42.166419 H 158.83319 v 40.000142 5.15e-4 L 105.83333,116.16707 52.833467,82.167076 v -5.15e-4 z M 4.8338133,42.166935 H 44.833438 V 206.16674 H 4.8338133 Z m 161.9999267,0 h 39.99963 V 206.16674 H 166.83374 Z M 52.833467,90.225502 101.83306,123.16664 v 5.2e-4 130.99924 H 52.833467 v -130.99924 -5.2e-4 z m 105.999723,0 v 32.941138 5.2e-4 130.99924 H 109.8336 v -130.99924 -5.2e-4 h 5.2e-4 z M 4.8338133,214.16677 H 44.833438 v 40.00014 H 4.8338133 Z m 161.9999267,0 h 39.99963 v 40.00014 h -39.99963 z";

// 1.7A 05
// let p:string = "M -3.1667319 34.166907 v 227.99952299999998 h 218.0001319 v -227.99952299999998 Z M 4.833814 42.166937000000004 h 39.999624999999995 v 40.000141 h -39.999624999999995 Z M 52.833467999999996 42.166937000000004 h 105.99973200000001 v 40.000141 h -105.999732 Z M 166.83373999999998 42.166937000000004 h 39.999629999999996 v 40.000141 h -39.99962999999997 Z M 52.833468 90.166588 h 105.999732 v 0.0005639999999971224 v 39.999628000000016 l -0.0010000000000047748 0.0005600000000072214 h 0.0010000000000047748 l -52.99987 33.99938 l -52.999862 -33.99947 h 0.001100000000000989 l -0.001100000000000989 -0.0005700000000103955 v -39.99957300000001 Z M 4.833814000000004 90.167152 h 39.999625 v 115.99963799999999 v 0.0005600000000072214 h -39.99962500000001 v -0.0005600000000072214 Z M 166.83373999999998 90.167152 h 39.999629999999996 v 115.999588 h -39.99962999999997 Z M 52.833468 139.22509 l 48.999592 32.94114999999999 v 0.0005600000000072214 h 0.0005100000000055616 v 81.99965 h -0.0005100000000055616 h -48.999592 v -81.99965 v -0.0005600000000072214 v -32.94063 Z M 158.8332 139.22509 v 0.0005700000000103955 v 32.94063 v 0.0005600000000072214 h 0.0005600000000072214 v 81.99964 h -0.0005600000000072214 h -48.9996 v -81.99964 v -0.0005600000000072214 h 0.0005199999999945248 Z M 4.833814 214.16677 h 39.999624999999995 v 40.000140000000016 h -39.999624999999995 Z M 166.83373999999998 214.16677 h 39.999629999999996 v 40.000140000000016 h -39.999629999999996 Z";

// D's for 1.8A: 1,2,3,4
// let p:string = "M -1.9848173 26.294517 v 227.99974300000002 h 218.0001373 v -227.99974300000002 Z M 6.014970699999999 34.294305 h 63.999954300000006 v 92.000045 h -63.999954300000006 Z M 78.015262 34.294305 h 23.999917999999994 v 92.000045 h -23.999917999999994 Z M 112.01533 34.294305 h 23.99991 v 92.000045 h -23.99991 Z M 144.01503 34.294305 h 63.999949999999984 v 92.000045 h -63.999949999999984 Z M 6.0149707 134.29469 h 97.00010929999999 v 47.99983 h -97.00010929999999 Z M 111.01542 134.29469 h 96.99956 v 47.99983 h -96.99956 Z M 6.0149707 190.2943 h 202.00000930000002 v 56.00017 h -202.00000930000002 Z";
// let p:string = "M -4.6037934 23.613402 v 227.99973799999998 h 218.0001434 v -227.99973799999998 Z M 3.3959946 31.613192 h 63.9999544 v 212.000158 h -63.9999544 Z M 75.39628599999999 31.613192 h 23.999916000000013 v 212.000158 h -23.999916 Z M 108.39643999999998 31.613192 h 23.999920000000003 v 212.000158 h -23.999920000000003 Z M 140.39614999999998 31.613192 h 63.99995000000001 v 212.000158 h -63.99995000000001 Z";
// let p:string = "M -3.1667353 38.912085 v 227.999735 h 218.0001353 v -227.999735 Z M 4.8330522 46.911873 h 97.00010780000001 v 40.000038 h -97.00010780000001 Z M 109.8335 46.911873 h 96.99955999999999 v 40.000038 h -96.99955999999999 Z M 4.8330522 94.912251 h 24.0004658 v 40.00004899999999 h -24.0004658 Z M 36.833304 94.912251 h 31.999702999999997 v 40.00004899999999 h -31.999702999999997 Z M 76.833344 94.912251 h 23.999916 v 40.00004899999999 h -23.999916 Z M 109.83349999999999 94.912251 h 23.99991 v 40.00004899999999 h -23.999909999999986 Z M 141.83319999999998 94.912251 h 32.00026 v 40.00004899999999 h -32.00025999999997 Z M 181.83324 94.912251 h 23.999920000000003 v 40.00004899999999 h -23.999920000000003 Z M 4.8330522 142.91209 h 63.9999548 v 115.99994000000001 h -63.9999548 Z M 76.833344 142.91209 h 23.999916 v 62.000140000000016 h -23.999916 Z M 109.83349999999999 142.91209 h 23.99991 v 62.000140000000016 h -23.999909999999986 Z M 141.83319999999998 142.91209 h 63.99995999999999 v 115.99994000000001 h -63.99995999999996 Z M 76.83334399999998 210.91221000000002 h 23.999916 v 47.99982 h -23.999915999999985 Z M 109.83349999999999 210.91221000000002 h 23.99991 v 47.99982 h -23.999909999999986 Z";
// let p:string = "M -3.1667353 31.003277 v 227.99973300000002 h 218.0001353 v -227.99973300000002 Z M 4.8330522 39.003065 h 202.0000078 v 32.000251999999996 h -202.0000078 Z M 4.8330522 79.00310300000001 h 40.000038800000006 v 172.000117 h -40.000038800000006 Z M 52.833431 79.00310300000001 h 105.999799 v 48.00038699999999 h -105.999799 Z M 166.83302 79.00310300000001 h 40.000039999999984 v 172.000117 h -40.000039999999984 Z M 52.833431 135.00328 h 105.999799 v 115.99994000000001 h -105.999799 Z";

// 1.7's
// 1
//let p:string = `M -42.584919,6.0771179 V 306.07383 H 257.41511 V 6.0771179 Z m 5.000074,5.0000751 H 17.414867 V 240.07629 h -54.999712 z m 60.999689,0 H 104.41483 V 195.07728 l -80.999986,42.99975 v -42.99975 z m 87.000516,0 h 80.99998 v 184.000087 42.99975 l -80.99998,-42.99975 z m 86.99996,0 h 54.99971 V 240.07629 h -54.99971 z m -90.00023,189.999517 84.00025,44.99954 v 55.00028 H 23.415397 v -55.00028 z m -144.999935,44.999 h 54.999712 v 55.00082 h -54.999712 z m 235.000165,0.003 h 54.99971 v 54.99971 h -54.99971 z`;

// 2
//let p:string = `M -42.584919,4.4937035 V 304.49373 H 257.41511 V 4.4937035 Z m 5.000074,5.0000747 H 17.414867 V 299.49365 h -54.999712 z m 60.999689,0 H 104.41483 V 299.49365 H 23.414844 Z m 87.000516,0 h 80.99943 V 299.49365 h -80.99943 z m 86.99941,0 h 54.9997 V 299.49365 h -54.9997 z`;

// 4
//let p:string = `M -44.166681,2.1210553 V 302.12108 H 255.83335 V 2.1210553 Z M 21.833635,7.0152969 H 189.83358 V 77.015214 L 105.83333,122.01532 21.833635,77.015214 Z M -39.166607,7.1211302 H 15.833105 V 236.12129 h -54.999712 z m 235.000167,0 h 54.99971 V 236.12129 H 195.83356 Z M 21.833082,84.777426 102.8011,128.10407 h 0.0314 v 0.0166 0 168.99986 H 21.833082 V 128.12072 128.1035 84.776862 Z m 167.999948,0 v 43.326644 0.0172 168.99987 H 108.8336 v -168.99987 -0.0172 h 0.032 z M -39.166607,242.12128 h 54.999712 v 54.99973 h -54.999712 z m 235.000167,0 h 54.99971 v 54.99973 h -54.99971 z`;

// 5
// let p:string = `M -44.166681,0.53929352 V 300.53932 H 255.83335 V 0.53929352 Z m 5.000074,5.00007488 H 15.833105 V 60.53909 h -54.999712 z m 60.999689,0 H 189.83358 V 60.53909 H 21.833082 Z m 174.000478,0 h 54.99971 V 60.53909 H 195.83356 Z M -39.166607,66.539079 H 15.833105 V 234.53903 h -54.999712 z m 61.000242,0 H 189.83358 V 136.53899 L 105.83333,181.5391 21.833635,136.53899 Z m 173.999925,0 h 54.99971 V 234.53903 H 195.83356 Z M 21.833082,144.30067 102.83197,187.64436 h 5.6e-4 v 0 107.89432 H 21.833096 v -107.89432 0 -43.34369 z m 167.999948,0 v 43.34369 0 107.89432 H 108.8336 v -107.89432 0 h 10e-4 l 80.99834,-43.34369 z m -228.999637,96.23832 h 54.999712 v 55.00026 h -54.999712 z m 235.000167,0 h 54.99971 v 55.00026 h -54.99971 z`;

// let p:string = "M -44.166681,0.53946792 V 300.5395 H 255.83335 V 0.53946792 Z m 5.000074,5.00007398 H 250.83327 V 51.539559 H -39.166607 Z m 0,51.9999971 H 50.83307 V 295.53943 h -89.999677 z m 96.000207,0 h 97.99946 V 147.53922 H 56.8336 Z m 103.99999,0 h 89.99968 V 295.53943 H 160.83359 Z M 56.8336,153.5392 h 97.99946 V 295.53943 H 56.8336 Z";
// let test:SVGTemplate = new SVGTemplate(p);
//let result:string[] = test.getScaledD(2, 2);
//console.log(test.getFileText(157/300, 211/300));
// console.log(test.getOptimizedD());
//console.log(test.getLaserCutPanes());
// let test:DividerWindow = new DividerWindow(undefined, undefined, 10, 10, undefined);
// console.log(test.windowSVG.getScaledD(2, 1)[0]);

// [
//     {id:5, name:"1_8Aframe04_development.svg", d:"M -44.166681,0.53946792 V 300.5395 H 255.83335 V 0.53946792 Z m 5.000074,5.00007398 H 250.83327 V 51.539559 H -39.166607 Z m 0,51.9999971 H 50.83307 V 295.53943 h -89.999677 z m 96.000207,0 h 97.99946 V 147.53922 H 56.8336 Z m 103.99999,0 h 89.99968 V 295.53943 H 160.83359 Z M 56.8336,153.5392 h 97.99946 V 295.53943 H 56.8336 Z"},
//     {id:4, name:"1_8Aframe03_development.svg", d:"M -44.166681,2.9122837 V 302.91231 H 255.83335 V 2.9122837 Z m 5.000074,5.000074 H 102.83307 V 75.912482 H -39.166607 Z m 148.000207,0 H 250.83327 V 75.912482 H 108.8336 Z M -39.166607,81.912461 H 2.8332432 V 149.91203 H -39.166607 Z m 47.9998271,0 H 50.83307 V 149.91203 H 8.8332201 Z m 48.0003799,0 h 45.99947 V 149.91203 H 56.8336 Z m 51.99945,0 h 46.00001 v 67.999569 h -46.00001 z m 52.00054,0 h 41.99985 v 67.999569 h -41.99985 z m 47.99983,0 h 41.99985 V 149.91203 H 208.83342 Z M -39.166607,155.91256 H 50.83307 v 141.99968 h -89.999677 z m 96.000207,0 h 45.99947 v 75.99991 H 56.8336 Z m 51.99945,0 h 46.00001 v 75.99991 h -46.00001 z m 52.00054,0 h 89.99968 V 297.91224 H 160.83359 Z M 56.8336,237.91245 h 45.99947 v 59.99979 H 56.8336 Z m 51.99945,0 h 46.00001 v 59.99979 h -46.00001 z"},
//     {id:3, name:"1_8Aframe02_development.svg", d:"M -44.166681,-0.25147069 V 299.74856 H 255.83335 V -0.25147069 Z m 5.000074,5.00007399 H 50.83307 V 294.74849 h -89.999677 z m 96.000207,0 h 45.99947 V 294.74849 H 56.8336 Z m 51.99945,0 h 46.00001 V 294.74849 h -46.00001 z m 52.00054,0 h 89.99968 V 294.74849 h -89.99968 z"},
//     {id:2, name:"1_8Aframe02_development.svg", d:"M -44.166681,-0.25147069 V 299.74856 H 255.83335 V -0.25147069 Z m 5.000074,5.00007399 H 50.83307 V 294.74849 h -89.999677 z m 96.000207,0 h 45.99947 V 294.74849 H 56.8336 Z m 51.99945,0 h 46.00001 V 294.74849 h -46.00001 z m 52.00054,0 h 89.99968 V 294.74849 h -89.99968 z"},
//     {id:1, name:"1_8Aframe01_development.svg", d:"M -44.166681,2.1213451 V 302.12137 H 255.83335 V 2.1213451 Z M 56.97416,7.2625302 h 45.71835 V 135.98012 H 56.97416 Z m 52,0 H 154.6925 V 135.98012 H 108.97416 Z M -38.969272,7.3187542 H 50.635734 V 135.92389 h -89.605006 z m 200.000202,0 h 89.60501 V 135.92389 H 161.03093 Z M -38.965965,142.3224 H 102.63243 v 66.59838 H -38.965965 Z m 148.000205,0 h 141.5984 v 66.59838 H 109.03424 Z M -38.962657,215.32536 H 250.62931 v 81.59197 H -38.962657 Z"}
//   ],