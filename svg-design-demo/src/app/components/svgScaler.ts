// Basic class for a vector
export class Vector {
    // Vector = [dx, dy]t + [bx, by] where timeDependentValues = [dx, dy] and basePoint = [bx, by]
    startX:number;
    endX:number;
    startY:number;
    endY:number;
    basePoint:number[];
    timeDependentValues:number[];

    constructor(startX:number, endX:number, startY:number, endY:number) {
        this.startX = startX;
        this.endX = endX;
        this.startY = startY;
        this.endY = endY;
        this.basePoint = [startX, startY];
        this.timeDependentValues = [endX-startX, endY-startY];
    }

    // Returns 90 degree rotated vector -> [my, -mx]
    rotate90Degrees():Vector {
        return new Vector(this.startX, this.startX+this.timeDependentValues[1], this.startY, this.startY-this.timeDependentValues[0]);

    }

    // Returns 270 degree rotated vector -> [-my, mx]
    rotate270Degrees():Vector {
        return new Vector(this.startX, this.startX-this.timeDependentValues[1], this.startY, this.startY+this.timeDependentValues[0]);
    }

    // Returns magnitude
    getMagnitude():number {
        return Math.sqrt( this.timeDependentValues[0]*this.timeDependentValues[0] + this.timeDependentValues[1]*this.timeDependentValues[1] );
    }

    // Multiplies vector by a certain value
    multiply(n:number):Vector {
        let result:Vector = this.getUnitVector();
        result.timeDependentValues[0] *= n;
        result.timeDependentValues[1] *= n;
        return result;
    }

    // Returns dot product of two vectors
    dotProduct(otherVector:Vector):number {
        return this.timeDependentValues[0]*otherVector.timeDependentValues[0] + this.timeDependentValues[1]*otherVector.timeDependentValues[1];
    }

    // Returns this vector's unit vector
    getUnitVector():Vector {
        return new Vector(this.startX, this.startX + this.timeDependentValues[0]/this.getMagnitude(), this.startY, this.startY + this.timeDependentValues[1]/this.getMagnitude());
    }

    // Returns resultant vector of addition
    addVector(otherVector:Vector):Vector {
        return new Vector(this.startX, this.endX + otherVector.timeDependentValues[0], this.startY, this.endY + otherVector.timeDependentValues[1]);
    }

    // Returns resultant vector of addition
    addVectorAtBase(otherVector:Vector):Vector {
        return new Vector(this.startX + otherVector.timeDependentValues[0], this.endX + otherVector.timeDependentValues[0], 
            this.startY + otherVector.timeDependentValues[1], this.endY + otherVector.timeDependentValues[1]);
    }

    // Returns point at which this vector intersects with the another vector
    findPointOfIntersection(otherVector:Vector):number[] {
        // Using the following starting conditions: 
        // dx1*t + bx1 = dx2 + bx2
        // dy1*s + by1 = dy2*s + by2
        let dx1:number = this.timeDependentValues[0];
        let dy1:number = this.timeDependentValues[1];
        let bx1:number = this.startX;
        let by1:number = this.startY;
        let dx2:number = otherVector.timeDependentValues[0];
        let dy2:number = otherVector.timeDependentValues[1];
        let bx2:number = otherVector.startX;
        let by2:number = otherVector.startY;

        // Getting s for when the lines intersect
        let s:number = ( (dx1*by2) - (dx1*by1) - dy1*(bx2-bx1) ) / ( (dy1*dx2) - (dy1*dy2) );

        // Using s to find the actual point and return it
        return [bx2 + s*dx2, by2 + s*dy2]; 
    }

}

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

    // Method to return good outset polygon -- testing for line art --
    goodOutset(outset:number):string {
        
        // let scaleX:number = (this.polygonWidth+(xOutset*2))/this.polygonWidth;
        // let scaleY:number = (this.polygonHeight+(yOutset*2))/this.polygonHeight;
        // let centerPoint:number[] = [this.polygonWidth/2 + this.xMin, this.polygonHeight/2 + this.yMin];
        let scaledPath:string[] = this.scalablePath.slice();
        // let differenceFromCenter:number[] = [Number(scaledPath[1])-centerPoint[0], Number(scaledPath[2])-centerPoint[1]];

        // Array to hold every polygon point
        let polygonPoints:number[][] = [];

        // Changing starting point to be scaled now
        // scaledPath[1] = (centerPoint[0] + (differenceFromCenter[0]*(scaleX))).toString();
        // scaledPath[2] = (centerPoint[1] + (differenceFromCenter[1]*scaleY)).toString();
        this.currentPoint = [Number(scaledPath[1]), Number(scaledPath[2])];
        polygonPoints.push(this.currentPoint);

        
        // Getting the polygon points
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
                    nextPoint = [this.currentPoint[0] + (Number(nextChars[0])), this.currentPoint[1] + (Number(nextChars[1]))];
                    break;
                case "h":
                    nextPoint = [this.currentPoint[0] + (Number(nextChars[0])), this.currentPoint[1]];
                    break;
                case "v":
                    nextPoint = [this.currentPoint[0], this.currentPoint[1] + (Number(nextChars[0]))];
                    break;
                case "c":
                    nextPoint = [this.currentPoint[0] + (Number(nextChars[4])), this.currentPoint[1] + (Number(nextChars[5]))];
                    polygonPoints.push([this.currentPoint[0]+Number(nextChars[0]), this.currentPoint[1]+Number(nextChars[1])]);
                    polygonPoints.push([this.currentPoint[0]+Number(nextChars[2]), this.currentPoint[1]+Number(nextChars[3])]);
                    break;
                // s will be added later (adds onto c)
                case "s":
                    break;
                case "q":
                    nextPoint = [this.currentPoint[0] + (Number(nextChars[2])), this.currentPoint[1] + (Number(nextChars[3]))];
                    polygonPoints.push([this.currentPoint[0]+Number(nextChars[0]), this.currentPoint[1]+Number(nextChars[1])]);
                    break;
                // t will be added later (adds onto q)
                case "t":
                    break;
                case "a":
                    nextPoint = [this.currentPoint[0] + (Number(nextChars[5])), this.currentPoint[1] + (Number(nextChars[6]))];
                    polygonPoints.push([this.currentPoint[0]+Number(nextChars[5]), this.currentPoint[1]+Number(nextChars[6])]);
                    break;
                default:
                    continue;
            }
            // Updating current point
            this.currentPoint = nextPoint;
            polygonPoints.push(this.currentPoint);
        }


        // *** Actually outsetting the polygon now using new algorithm ***
        // Looping through each point in the polygon
        const numPolygonPoints:number = polygonPoints.length;
        let newPolygonPoints:number[][] = []; 
        for(let i:number = 0; i < numPolygonPoints; ++i) {
            let vector1:Vector, vector2:Vector;
            let prevPointIndex:number, nextPointIndex:number;
            
            // Getting the correct indexes for the next and previous points
            if(i != 0 && i != numPolygonPoints-1) {
                prevPointIndex = i-1;
                nextPointIndex = i+1;
            }
            else if(i == 0) {
                prevPointIndex = numPolygonPoints-1;
                nextPointIndex = i+1;
            }
            else {
                prevPointIndex = i-1;
                nextPointIndex = 0;
            }

            // Issue with prev point to current
            while( ((Math.abs(polygonPoints[prevPointIndex][0] - polygonPoints[i][0]) < 2) 
                    && (Math.abs(polygonPoints[prevPointIndex][1] - polygonPoints[i][1]) < 2)) ) {
                // newPolygonPoints.push([prevPointIndex]);
                // continue;
                --prevPointIndex;
                if(prevPointIndex < 0) {prevPointIndex = numPolygonPoints-1;}
            }
            // Issue with next point to current
            while( ((Math.abs(polygonPoints[nextPointIndex][0] - polygonPoints[i][0]) < 2) 
                    && (Math.abs(polygonPoints[nextPointIndex][1] - polygonPoints[i][1]) < 2)) ) {
                //newPolygonPoints.push([nextPointIndex]);
                //continue;
                ++nextPointIndex;
                if(nextPointIndex > numPolygonPoints-1) {nextPointIndex = 0;}
            }

            // if( ((Math.abs(polygonPoints[prevPointIndex][0] - polygonPoints[i][0]) < .0001) 
            //         && (Math.abs(polygonPoints[prevPointIndex][1] - polygonPoints[i][1]) < .0001))
            //     || ((Math.abs(polygonPoints[nextPointIndex][0] - polygonPoints[i][0]) < .0001) 
            //         && (Math.abs(polygonPoints[nextPointIndex][1] - polygonPoints[i][1]) < .0001))) {
            //
            //     polygonPoints[i][0] += .01;
            //     polygonPoints[i][1] += .01;
            // }

            
            // Getting vector1 prevPoint->currentPoint and vector2 = nextPoint->currentPoint
            // Next point uses first pair in array, prev uses last (in case of cubic curve)
            vector1 = new Vector(polygonPoints[prevPointIndex][0], polygonPoints[i][0], 
                polygonPoints[prevPointIndex][1], polygonPoints[i][1]);
            vector2 = new Vector(polygonPoints[nextPointIndex][0], polygonPoints[i][0], 
                polygonPoints[nextPointIndex][1], polygonPoints[i][1]);


            // Getting rotated vectors 
            let vector1_90:Vector = vector1.rotate270Degrees();
            let vector2_270:Vector = vector2.rotate90Degrees();

            // Getting my normalized na and nb
            let na:Vector = new Vector(vector1.endX, vector1.endX+vector1_90.timeDependentValues[0], vector1.endY, vector1.endY+vector1_90.timeDependentValues[1]).getUnitVector();
            let nb:Vector = new Vector(vector2.endX, vector2.endX+vector2_270.timeDependentValues[0], vector2.endY, vector2.endY+vector2_270.timeDependentValues[1]).getUnitVector();

            // Getting normalized bisector
            let bisector:Vector = na.addVector(nb).getUnitVector();
            let bisectorLength:number = outset / Math.sqrt( (1 + na.dotProduct(nb))/2 );
            bisector = bisector.multiply(bisectorLength);

            // Getting parallel vectors exactly outset by the given outset value
            let vector1_parallel:Vector = vector1.addVectorAtBase(vector1_90.getUnitVector().multiply(outset));
            let vector2_parallel:Vector = vector2.addVectorAtBase(vector2_270.getUnitVector().multiply(outset));
            // console.log("HERE::::: [" + vector1_90.getUnitVector().multiply(outset).timeDependentValues + "]t + [" + vector1_90.getUnitVector().multiply(outset).basePoint + "]")
            // console.log("V1: [" + vector1.timeDependentValues + "]t + [" + vector1.basePoint+"]");
            // console.log("V1_90: [" + vector1_90.timeDependentValues + "]t + [" + vector1_90.basePoint+"]");
            // console.log("V1_parallel: [" + vector1_parallel.timeDependentValues + "]t + [" + vector1_parallel.basePoint+"]");
            // console.log(" HEREv2::::: [" + vector2_270.getUnitVector().multiply(outset).timeDependentValues + "]t + [" + vector2_270.getUnitVector().multiply(outset).basePoint + "]")
            // console.log(" V2: [" + vector2.timeDependentValues + "]t + [" + vector1.basePoint+"]");
            // console.log(" V2_90: [" + vector2_270.timeDependentValues + "]t + [" + vector2_270.basePoint+"]");
            // console.log(" V2_parallel: [" + vector2_parallel.timeDependentValues + "]t + [" + vector2_parallel.basePoint+"]");
            //console.log("Vector1: " + vector1_parallel.timeDependentValues + "t + " + vector1_parallel.basePoint + "\n");
            // Getting new point for outset polygon
            // console.log("na: [" + na.timeDependentValues + "]t + [" + na.basePoint + "]");
            // console.log("nb: [" + nb.timeDependentValues + "]s + [" + nb.basePoint + "]");
            let newPoint:number[] = [vector1.endX+bisector.timeDependentValues[0], vector1.endY+bisector.timeDependentValues[1]];
            // let newPoint:number[] = vector1_parallel.findPointOfIntersection(vector2_parallel);
            // if(vector1_parallel.getUnitVector().timeDependentValues[0] == -vector2_parallel.getUnitVector().timeDependentValues[0]
            //     && vector1_parallel.getUnitVector().timeDependentValues[1] == -vector2_parallel.getUnitVector().timeDependentValues[0]) {newPoint = [vector1.endX + vector1_90.timeDependentValues[0], vector1.endY + vector1_90.timeDependentValues[1]]; console.log("Parallel Points");}
            newPolygonPoints.push(newPoint);
        }

        // Getting all nodes that should be the same
        for(let i:number = 0; i < newPolygonPoints.length; ++i) {
            if(newPolygonPoints[i].length == 1) {newPolygonPoints[i] = newPolygonPoints[newPolygonPoints[i][0]];} 
        }
        // console.log("\n\nOrig Points: ");
        // console.log(polygonPoints);
        // console.log("\n\nNew Points: ");
        // console.log(newPolygonPoints);



        // Starting the starting point at the new polygon point start
        let currentPointNumber:number = 0;
        scaledPath[1] = String(newPolygonPoints[currentPointNumber][0]);
        scaledPath[2] = String(newPolygonPoints[currentPointNumber][1]);

        // Outsetting the actual scaledPath now
        this.currentPoint = [Number(scaledPath[1]), Number(scaledPath[2])];
        for(let i:number = 3; i < scaledPath.length - 1; ++i) {
            nextPoint = []; diffPoints = []; nextChars = [];
            // Getting the next numbers to go with this command
            for(let j:number = i+1; "MmLlHhVvAaCcZz".indexOf(scaledPath[j]) == -1; ++j) {nextChars = nextChars.concat(scaledPath[j].split(","));}
            switch(scaledPath[i]) {
                case "m":
                case "l":
                    nextPoint = [newPolygonPoints[currentPointNumber+1][0], newPolygonPoints[currentPointNumber+1][1]];
                    diffPoints = [nextPoint[0]-this.currentPoint[0], nextPoint[1]-this.currentPoint[1]];
                    // Updating with new scaled values
                    for(let k:number = 0; k < diffPoints.length; ++k) {scaledPath[i+(k+1)] = diffPoints[k].toString();}
                    break;
                case "h":
                    nextPoint = [newPolygonPoints[currentPointNumber+1][0], this.currentPoint[1]];
                    diffPoints = [nextPoint[0]-this.currentPoint[0], 0];
                    // Updating with new scaled values
                    scaledPath[i+1] = diffPoints[0].toString();
                    break;
                case "v":
                    nextPoint = [this.currentPoint[0], newPolygonPoints[currentPointNumber+1][1]];
                    diffPoints = [0, nextPoint[1]-this.currentPoint[1]];
                    // Updating with new scaled values
                    scaledPath[i+1] = diffPoints[1].toString();
                    break;
                case "c":
                    for(let k:number = 0; k < 3; ++k) {
                        nextPoint = [newPolygonPoints[currentPointNumber+1][0], newPolygonPoints[currentPointNumber+1][1]];
                        diffPoints = [nextPoint[0]-this.currentPoint[0], nextPoint[1]-this.currentPoint[1]];
                        scaledPath[i+1+(k*2)] = diffPoints[0].toString();
                        scaledPath[i+1+(k*2)+1] = diffPoints[1].toString();
                        if(k != 2) {++currentPointNumber;} // Updating current point for control points
                    }
                    break;
                // s will be added later (adds onto c)
                case "s":
                    break;
                case "q":
                    for(let k:number = 0; k < 2; ++k) {
                        nextPoint = [newPolygonPoints[currentPointNumber+1][0], newPolygonPoints[currentPointNumber+1][1]];
                        diffPoints = [nextPoint[0]-this.currentPoint[0], nextPoint[1]-this.currentPoint[1]];
                        scaledPath[i+1+(k*2)] = diffPoints[0].toString();
                        scaledPath[i+1+(k*2)+1] = diffPoints[1].toString();
                        if(k != 1) {++currentPointNumber;} // Updating current point for control points
                    }
                    break;
                // t will be added later (adds onto q)
                case "t":
                    break;
                case "a":
                    nextPoint = [newPolygonPoints[currentPointNumber+1][0], newPolygonPoints[currentPointNumber+1][1]];
                    for(let k:number = 0; k < nextChars.length; ++k) {
                        // Keep same angle, sweep flag, etc.
                        if(k == 5) {diffPoints.push(nextPoint[0]-this.currentPoint[0]);}
                        else if(k == 6) {diffPoints.push(nextPoint[1]-this.currentPoint[1]);}
                        else if(k == 0 || k == 1) {diffPoints.push(Number(nextChars[k]) + outset);}
                        else {diffPoints.push(Number(nextChars[k]));}
                        scaledPath[i+(k+1)] = diffPoints[k].toString();
                    }
                    break;
                default:
                    continue;
            }
            // Updating current point
            this.currentPoint = nextPoint;
            ++currentPointNumber;
        }


        return scaledPath.join(" ").trim();
    }


    // Method to scale the polygon -- testing for line art -- works
    // Method to return outset polygon
    lineScale(scaleX:number, scaleY:number):string {
        let scaledPath:string[] = this.scalablePath.slice();
        scaledPath[1] = String(Number(scaledPath[1])*scaleX);
        scaledPath[2] = String(Number(scaledPath[2])*scaleY);
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
                    nextPoint = [this.currentPoint[0] + (Number(nextChars[0])), this.currentPoint[1] + (Number(nextChars[1]))];
                    diffPoints = [(nextPoint[0]-this.currentPoint[0])*scaleX, (nextPoint[1]-this.currentPoint[1])*scaleY];
                    // Updating with new scaled values
                    for(let k:number = 0; k < diffPoints.length; ++k) {scaledPath[i+(k+1)] = diffPoints[k].toString();}
                    break;
                case "h":
                    nextPoint = [this.currentPoint[0] + (Number(nextChars[0])), this.currentPoint[1]];
                    diffPoints = [(nextPoint[0]-this.currentPoint[0])*scaleX, 0];
                    // Updating with new scaled values
                    scaledPath[i+1] = diffPoints[0].toString();
                    break;
                case "v":
                    nextPoint = [this.currentPoint[0], this.currentPoint[1] + (Number(nextChars[0]))];
                    diffPoints = [0, (nextPoint[1]-this.currentPoint[1])*scaleY];
                    // Updating with new scaled values
                    scaledPath[i+1] = diffPoints[1].toString();
                    break;
                case "c":
                    nextPoint = [this.currentPoint[0] + (Number(nextChars[4])), this.currentPoint[1] + (Number(nextChars[5]))];
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
                    nextPoint = [this.currentPoint[0] + (Number(nextChars[2])), this.currentPoint[1] + (Number(nextChars[3]))];
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
                    nextPoint = [this.currentPoint[0] + (Number(nextChars[5])), this.currentPoint[1] + (Number(nextChars[6]))];
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
    panelsetId:number;
    panelNumber:number;
    numberRotations:number;
    flipped:boolean;

    width:number;
    height:number;

    outerEdgeIndex:number;
    autofillString:string;
    scaledD:string[];
    scaledTransform:string;

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
        this.scaledD = [];
        this.outerEdgeIndex = 0;
        // Identifying outer edge of template (rest is the panes)
        for(let i:number = 0; i < this.subShapes.length; ++i) {
            if(this.subShapes[i].polygonWidth == this.width && this.subShapes[i].polygonHeight == this.height) {
                this.outerEdgeIndex = i;
                this.scaledD.push(this.getOptimizedD());
            }
            else {
                this.scaledD.push(this.subShapes[i].getScalablePath());
            }

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
        // Getting outset values for reducing wallwidth in x/y
        let xOutset:number = (3*this.width*(scaleX-1)) / (scaleX*this.width - 6);
        let yOutset:number = (3*this.height*(scaleY-1)) / (scaleY*this.height - 6);
        

        // Getting new scale values
        let newScaleX:number = (scaleX*this.width) / (this.width - (2*xOutset));
        let newScaleY:number = (scaleY*this.height) / (this.height - (2*yOutset));
        
        // Looping through and outsetting each polygon by a certain value
        for(let i:number = 0; i < this.subShapes.length; ++i) {
            if(i == this.outerEdgeIndex) {this.scaledD[0] = (this.subShapes[i].outset(-xOutset, -yOutset) + " ");}
            else {
                this.scaledD[0] += this.subShapes[i].outset(xOutset, yOutset) + " ";
                this.scaledD[i] = (this.subShapes[i].outset(xOutset, yOutset));
            }
        }
        //console.log(this.scaledD);
        return [this.scaledD[0].trim(), newScaleX.toString(), newScaleY.toString()];
    }

    // Method to get a scaled version of the template --> returns [scaledD] -- testing for line art --
    getLineScaledD(scaleX:number, scaleY:number, outerOutset:number=3, innerOutset:number=3):string {
        let scaledD:string = "";
        
        
        // Looping through and outsetting each polygon by a certain value
        for(let i:number = 0; i < this.subShapes.length; ++i) {
            let test:Polygon = new Polygon(this.subShapes[i].lineScale(scaleX, scaleY));
            // scaledD += test.getScalablePath() + " ";
            // console.log("Polygon " + i + ": \n");
            if(i == this.outerEdgeIndex) {scaledD += test.goodOutset(outerOutset) + " ";}
            else {scaledD += test.goodOutset(innerOutset) + " ";}
        }
        return scaledD.trim();
    }

    // Method to get a scaled version of the template --> returns [scaledD] -- testing for line art --
    getLineScaledPanes(scaleX:number, scaleY:number):string {
        let scaledD:string = "";
        
        
        // Looping through and outsetting each polygon by a certain value
        for(let i:number = 0; i < this.subShapes.length; ++i) {
            let test:Polygon = new Polygon(this.subShapes[i].lineScale(scaleX, scaleY));
            // scaledD += test.getScalablePath() + " ";
            if(i != this.outerEdgeIndex) {scaledD += test.goodOutset(1.75) + " ";}
        }
        return scaledD.trim();
    }

    // Scales template and updates the scaled d's and transform value
    scaleTemplate(scaleX:number, scaleY:number) {
        this.getScaledD(scaleX, scaleY);
        this.getTransform(scaleX, scaleY);
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

    getTransform(scaleX:number = 1, scaleY:number = 1):string {
        let xOutset:number = (3.5*this.width - 6*(scaleX*this.width-2.5)) / (7 - 2*(scaleX*this.width-2.5));
        let yOutset:number = (3.5*this.height - 6*(scaleY*this.height-2.5)) / (7 - 2*(scaleY*this.height-2.5));

        // Getting new scale values
        let newScaleX:number = 3.5 / (6 - (2 * xOutset));
        let newScaleY:number = 3.5 / (6 - (2 * yOutset));

        const rotationAmount:number = this.numberRotations * 90;
        const flipNumber:number = this.flipped ? -1 : 1;
        const centerX:number = this.xMin + (this.width/2);
        const centerY:number = this.yMin + (this.height/2);

        let finalTransform:string = "scale(" + newScaleX + "," + newScaleY + ") " + "rotate(" + rotationAmount + ", " + centerX + ", " + centerY + ") scale(" + flipNumber + ",1) " + (this.flipped ? " translate(" + (-2*centerX) + ", 0)" : "");
        this.scaledTransform = finalTransform;
        return finalTransform;
    }
}

//let p:string = "m 15.468768,31.206015 v 2.999816 107.000179 h 85.999912 v -0.0584 c 9.33349,1.7e-4 18.6667,1.6e-4 27.99985,0 v 0.0584 h 85.99992 V 31.206015 H 133.4688 c -10.66643,2.41e-4 -21.33322,1.98e-4 -32.00012,0 z m 5.999633,6.000149 h 31.000176 v 24.000089 a 3.0000051,3.0000051 0 0 0 0.104902,0.76894 c -9.517745,2.53253 -16.642895,11.04127 -17.082161,21.2323 a 3.0000051,3.0000051 0 0 0 -0.02273,-0.002 H 21.468401 Z m 37.000325,0 h 36.99981 V 131.04436 L 74.066742,101.08133 c 4.546817,-4.206697 7.401613,-10.217847 7.401613,-16.874937 0,-12.66701 -10.332625,-23.00014 -22.999629,-23.00014 z m 42.999954,0 c 9.33349,1.75e-4 18.6667,1.64e-4 27.99985,0 v 97.941316 c -9.33312,1.5e-4 -18.6664,1.8e-4 -27.99985,0 z m 34,0 h 36.99981 v 24.000089 a 3.0000051,3.0000051 0 0 0 0.002,0.0227 c -12.20682,0.52616 -22.00175,10.64508 -22.00175,22.97741 0,6.36257 2.60753,12.13538 6.80785,16.306497 l -21.80745,30.53095 z m 42.99996,0 h 31.00017 v 45.999779 h -13.02349 c -0.45444,-10.52642 -8.0422,-19.25733 -18.03146,-21.46123 a 3.0000051,3.0000051 0 0 0 0.0548,-0.53846 z M 58.468726,67.206403 c 9.424363,0 16.999995,7.57563 16.999995,16.99999 0,9.42436 -7.575632,16.999997 -16.999995,16.999997 -9.424363,0 -16.999994,-7.575637 -16.999994,-16.999997 0,-9.42436 7.575631,-16.99999 16.999994,-16.99999 z m 114.999704,0 c 9.42436,0 16.99999,7.57563 16.99999,16.99999 0,9.42436 -7.57563,16.999997 -16.99999,16.999997 -9.42436,0 -17,-7.575637 -17,-16.999997 0,-9.42436 7.57564,-16.99999 17,-16.99999 z M 36.007049,89.151833 c 2.273358,10.30411 11.49165,18.054187 22.461677,18.054187 3.860094,0 7.502467,-0.96082 10.702706,-2.65358 l 21.895305,30.65342 H 21.468401 V 89.206093 H 35.46858 a 3.0000051,3.0000051 0 0 0 0.538469,-0.0543 z m 159.911171,0.0543 h 13.55059 V 135.2059 h -69.59833 l 22.17694,-31.04823 c 3.36863,1.93844 7.26925,3.04839 11.42101,3.04839 10.95078,0 20.15611,-7.722857 22.44979,-17.999927 z";

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