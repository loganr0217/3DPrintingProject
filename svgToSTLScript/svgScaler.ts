import { Options, PythonShell } from "python-shell";
import fetch from "node-fetch";

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

    // Constructor which takes the width and height of the window
    constructor(width:number = 200, height:number = 200, numHorzDividers:number = 0, numVertDividers:number = 0, dividerWidth:number = 8, dividerType:string="plain", doubleHung:boolean=false) {
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
        
        // Initialize windowPanes
        this.windowPanes = [];
        this.initializeWindowPanes();
        this.createWindowPerimeter(width, height);

        this.windowSVG = new SVGTemplate(this.dString);
    }

    // Method to create window perimeter SVG using width and height
    createWindowPerimeter(width:number, height:number):void {
        this.dString = this.createSVGBox(width+12, height+12, true, [-6, -6]) + " " +
        this.createSVGBox(width+4, height+4, true, [-2, -2]);
        if(this.dividerType != "raiseddiv") {this.dString += this.createSVGBox(width, height, true, [0, 0]);}

        // creating bottom of 2xhung if necessary
        if(this.doubleHung) {
            this.dString += this.createSVGBox(width+12, height+12, true, [-6, height+6]) + " " +
            this.createSVGBox(width+4, height+4, true, [-2, height+10]);
            if(this.dividerType != "raiseddiv") {this.dString += this.createSVGBox(width, height, true, [0, height+12]);}
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
            // Initializing array
            startingPoint = [0,this.windowHeight];
            for(let row = this.numberVerticalPanes; row < 2*this.numberVerticalPanes; ++row) {
                this.windowPanes[row] = [];
                for(let col = 0; col < this.numberHorizontalPanes; ++col) {
                    startingPoint = [col*paneWidth + col*this.dividerWidth, row*paneHeight + row*this.dividerWidth + 12 - this.dividerWidth];
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
            while( ((Math.abs(polygonPoints[prevPointIndex][0] - polygonPoints[i][0]) < .1) 
                    && (Math.abs(polygonPoints[prevPointIndex][1] - polygonPoints[i][1]) < .1)) ) {
                // newPolygonPoints.push([prevPointIndex]);
                // continue;
                --prevPointIndex;
                if(prevPointIndex < 0) {prevPointIndex = numPolygonPoints-1;}
            }
            // Issue with next point to current
            while( ((Math.abs(polygonPoints[nextPointIndex][0] - polygonPoints[i][0]) < .1) 
                    && (Math.abs(polygonPoints[nextPointIndex][1] - polygonPoints[i][1]) < .1)) ) {
                //newPolygonPoints.push([nextPointIndex]);
                //continue;
                ++nextPointIndex;
                if(nextPointIndex > numPolygonPoints-1) {nextPointIndex = 0;}
            }

            // if( ((Math.abs(polygonPoints[prevPointIndex][0] - polygonPoints[i][0]) < .0001) 
            //         && (Math.abs(polygonPoints[prevPointIndex][1] - polygonPoints[i][1]) < .0001))
            //     || ((Math.abs(polygonPoints[nextPointIndex][0] - polygonPoints[i][0]) < .0001) 
            //         && (Math.abs(polygonPoints[nextPointIndex][1] - polygonPoints[i][1]) < .0001))) {
            //     console.log("FUCK!!!");
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
            // console.log("HA: " + bisectorLength);
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
        // console.log(scaledPath.join(" ").trim());
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
    paneColorString:string[];

    width:number;
    height:number;

    outerEdgeIndex:number;

    // Array to hold the polygons making up the template
    subShapes:Polygon[];

    // Basic constructor which takes d attribute (string)
    constructor(svgPath:string) {
        this.polygonPaths = svgPath.split("z").join("z; ").split("Z").join("Z; ").split("; ");
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

    // Method to get a scaled version of the template --> returns [scaledD] -- testing for line art --
    getLineScaledD(scaleX:number, scaleY:number, outerOutset:number=3, innerOutset:number=3):string {
        let scaledD:string = "";
        
        
        // Looping through and outsetting each polygon by a certain value
        for(let i:number = 0; i < this.subShapes.length; ++i) {
            let test:Polygon = new Polygon(this.subShapes[i].lineScale(scaleX, scaleY));
            // scaledD += test.getScalablePath() + " ";
            //console.log("Polygon " + i + ": \n");
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

    /*
    Equations to get xOutset and newScale (different for panes):
    newScaleX = (scaleX*width+2paneTolerance) / (width - 2xOutset)
    (railWidth - 2xOutset)*newScaleX = railWidth + 2paneTolerance
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

    // Method to get area for laser cut panes
    getPanelPanesArea(scaleX:number=1, scaleY:number=1):number {
        let panesArea:number = 0;
        let xOutset:number = (3.5*this.width - 6*(scaleX*this.width-2.5)) / (7 - 2*(scaleX*this.width-2.5));
        let yOutset:number = (3.5*this.height - 6*(scaleY*this.height-2.5)) / (7 - 2*(scaleY*this.height-2.5));

        // Getting new scale values
        let newScaleX:number = 3.5 / (6 - (2 * xOutset));
        let newScaleY:number = 3.5 / (6 - (2 * yOutset));
        let paneWidth:number, paneHeight:number;
        // Looping through each pane and outsetting by 2mm so pane will fit in aperture
        for(let i:number = 0; i < this.subShapes.length; ++i) {
            if(i != this.outerEdgeIndex) {
                paneWidth = (this.subShapes[i].xMax - this.subShapes[i].xMin + 2.5) * newScaleX;
                paneHeight = (this.subShapes[i].yMax - this.subShapes[i].yMin + 2.5) * newScaleY;
                panesArea += (paneWidth * paneHeight);
            }
        }
        //return [result.trim(), newScaleX.toString(), newScaleY.toString()];
        return panesArea;
    }

    // Method to get area for laser cut panes
    getPanelPanesAreaPerColor(scaleX:number=1, scaleY:number=1):Map<"color", "paneArea"> {
        let panesAreas = new Map();
        let xOutset:number = (3.5*this.width - 6*(scaleX*this.width-2.5)) / (7 - 2*(scaleX*this.width-2.5));
        let yOutset:number = (3.5*this.height - 6*(scaleY*this.height-2.5)) / (7 - 2*(scaleY*this.height-2.5));

        // Getting new scale values
        let newScaleX:number = 3.5 / (6 - (2 * xOutset));
        let newScaleY:number = 3.5 / (6 - (2 * yOutset));
        let paneWidth:number, paneHeight:number;
        // Looping through each pane and outsetting by 2mm so pane will fit in aperture
        for(let i:number = 0; i < this.subShapes.length; ++i) {
            if(i != this.outerEdgeIndex) {
                paneWidth = (this.subShapes[i].xMax - this.subShapes[i].xMin + 2.5) * newScaleX;
                paneHeight = (this.subShapes[i].yMax - this.subShapes[i].yMin + 2.5) * newScaleY;
                if(panesAreas.get(this.paneColorString[i-1]) == undefined) {panesAreas.set(this.paneColorString[i-1], paneWidth*paneHeight);}
                else {panesAreas.set(this.paneColorString[i-1], panesAreas.get(this.paneColorString[i-1]) + paneWidth*paneHeight);}
                //panesArea += (paneWidth * paneHeight);
            }
        }
        //return [result.trim(), newScaleX.toString(), newScaleY.toString()];
        return panesAreas;
    }

    getLineartFileText(newWidth:number, newHeight:number, outerOutset:number=3, innerOutset:number=3, svgFileName:string = "panelFile"):string {
        //

        let scaledDInfo:string = this.getLineScaledD((newWidth-6)/320, (newHeight-6)/320, outerOutset, innerOutset);
        let paths:string = `\n
            <path
                id="rect569"
                style="fill:#ececec;stroke-width:0.999999"
                d="` + scaledDInfo + `"
                transform="` + this.getFileTransform(1, 1) + `" /> \n
            `;

        let svgSizeInfo:string = "\nwidth='"+(newWidth)+"mm'\n" +
            "height='"+(newHeight)+"mm'\n" +
            "viewBox='"+0 + " " + 0 + " " + (newWidth) + " " + (newHeight) + "'\n";
        
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

        let options:Options = {
            args: [String(newWidth), String(newHeight), fullFileText, svgFileName]
        };

        PythonShell.run('svgFileGenerator.py', options, function (err, results) {
            if (err) throw err;
            // results is an array consisting of messages collected during execution
            console.log('results: %j', results);
        });
        return fullFileText;
    }

    getFileText(scaleX:number, scaleY:number, svgFileName:string = "panelFile"):string {
        //

        let scaledDInfo:string[] = this.getScaledD(scaleX, scaleY);
        let paths:string = `\n
            <path
                id="rect569"
                style="fill:#ececec;stroke-width:0.999999"
                d="` + scaledDInfo[0] + `"
                transform="` + this.getFileTransform(1, 1) + `" /> \n
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

        let options:Options = {
            args: [String(this.width*scaleX), String(this.height*scaleY), fullFileText, svgFileName]
        };

        PythonShell.run('svgSTLConversion.py', options, function (err, results) {
            if (err) throw err;
            // results is an array consisting of messages collected during execution
            console.log('results: %j', results);
        });
        return fullFileText;
    }

    getLineartPanesFileText(newWidth:number, newHeight:number, svgFileName:string = "panesFile", sortedPanesInfo):string {
        let scaledDInfo:string = this.getLineScaledPanes((newWidth-6)/320, (newHeight-6)/320);
        let individualPanes:string[] = scaledDInfo.split("Z");
        let paths:string = "";
        console.log("svg width:" + this.width);
        let widthHeightPolygonCheck:SVGTemplate;
        for(let i:number = 1; i < this.subShapes.length; ++i) {
            widthHeightPolygonCheck = new SVGTemplate(individualPanes[i-1] + " Z");
            let tmp:{paneHex:string, paneWidth:number, paneHeight:number, d:string, transform:string} = {
                paneHex:this.paneColorString[i-1], 
                paneWidth:widthHeightPolygonCheck.width, 
                paneHeight:widthHeightPolygonCheck.height,
                d:individualPanes[i-1] + " Z",
                transform:this.getFileTransform(1, 1)
            }
            if(sortedPanesInfo.has(tmp.paneHex)) {
                let tmpArray = sortedPanesInfo.get(tmp.paneHex);
                tmpArray.push(tmp);
                sortedPanesInfo.set(tmp.paneHex, tmpArray);
            }
            else {
                sortedPanesInfo.set(tmp.paneHex, [tmp]);
            }
            paths += `\n
            <path
                id="rect` + i + `"
                style="fill:#` + this.paneColorString[i-1] + `;stroke-width:0.999999"
                d="` + individualPanes[i-1] + ` Z"
                transform="` + this.getFileTransform(1, 1) + `" /> \n
            `;
        } 

        let svgSizeInfo:string = "\nwidth='"+(newWidth)+"mm'\n" +
            "height='"+(newHeight)+"mm'\n" +
            "viewBox='"+0 + " " + 0 + " " + (newWidth) + " " + (newHeight) + "'\n";
        
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
    ` + 
    paths + 
`     
</svg>
`

        let options:Options = {
            args: [String(newWidth), String(newHeight), fullFileText, svgFileName]
        };

        PythonShell.run('svgFileGenerator.py', options, function (err, results) {
            if (err) throw err;
            // results is an array consisting of messages collected during execution
            console.log('results: %j', results);
        });
        return fullFileText;
    }

    getPanesFileText(scaleX:number, scaleY:number, svgFileName:string = "panesFile", sortedPanesInfo):string {
        //
        let xOutset:number = (3.5*this.width - 6*(scaleX*this.width-2.5)) / (7 - 2*(scaleX*this.width-2.5));
        let yOutset:number = (3.5*this.height - 6*(scaleY*this.height-2.5)) / (7 - 2*(scaleY*this.height-2.5));

        // Getting new scale values
        let newScaleX:number = 3.5 / (6 - (2 * xOutset));
        let newScaleY:number = 3.5 / (6 - (2 * yOutset));
        let scaledDInfo:string[] = this.getLaserCutPanes(scaleX, scaleY);
        let individualPanes:string[] = scaledDInfo[0].split("Z");
        let paths:string = "";
        console.log("svg width:" + this.width);
        for(let i:number = 1; i < this.subShapes.length; ++i) {
            let tmp:{paneHex:string, paneWidth:number, paneHeight:number, d:string, transform:string} = {
                paneHex:this.paneColorString[i-1], 
                paneWidth:((this.subShapes[i].xMax - this.subShapes[i].xMin))*newScaleX, 
                paneHeight:((this.subShapes[i].yMax - this.subShapes[i].yMin))*newScaleY,
                d:individualPanes[i-1] + " Z",
                transform:this.getFileTransform(Number(scaledDInfo[1]), Number(scaledDInfo[2]))
            }
            if(sortedPanesInfo.has(tmp.paneHex)) {
                let tmpArray = sortedPanesInfo.get(tmp.paneHex);
                tmpArray.push(tmp);
                sortedPanesInfo.set(tmp.paneHex, tmpArray);
            }
            else {
                sortedPanesInfo.set(tmp.paneHex, [tmp]);
            }
            paths += `\n
            <path
                id="rect` + i + `"
                style="fill:#` + this.paneColorString[i-1] + `;stroke-width:0.999999"
                d="` + individualPanes[i-1] + ` Z"
                transform="` + this.getFileTransform(Number(scaledDInfo[1]), Number(scaledDInfo[2])) + `" /> \n
            `;
        } 

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
    ` + 
    paths + 
`     
</svg>
`

        let options:Options = {
            args: [String(this.width*scaleX), String(this.height*scaleY), fullFileText, svgFileName]
        };

        PythonShell.run('svgSTLConversion.py', options, function (err, results) {
            if (err) throw err;
            // results is an array consisting of messages collected during execution
            console.log('results: %j', results);
        });
        return fullFileText;
    }
    

    getTransform():string {
        const rotationAmount:number = this.numberRotations * 90;
        const flipNumber:number = this.flipped ? -1 : 1;
        const centerX:number = this.xMin + (this.width/2);
        const centerY:number = this.yMin + (this.height/2);
        return "rotate(" + rotationAmount + ", " + centerX + ", " + centerY + ") scale(" + flipNumber + ",1) " + (this.flipped ? " translate(" + (-2*centerX) + ", 0)" : "");
    }

    getFileTransform(scaleX:number = 1, scaleY:number = 1) {
        const rotationAmount:number = this.numberRotations * 90;
        const flipNumber:number = this.flipped ? -1 : 1;
        const centerX:number = this.xMin + (this.width/2);
        const centerY:number = this.yMin + (this.height/2);
        return  "scale(" + scaleX*flipNumber + "," + scaleY + ") " + "rotate(" + rotationAmount + ", " + centerX + ", " + centerY + ")";
    }
}

export class LightScreen {
    lightscreenPanels:SVGTemplate[];
    panelData:{id:number, name:string, d:string}[][];
    templateData:{id:number, numberPanelsX:number, numberPanelsY:number, tempString:string, access:string}[] = [];
    //templateData:{id:number, numPanels:number, panelDims:number[], tempString:string}[];
    orderData:{id:number, userEmail:string, selectedDividerType:string, unitChoice:string, 
    windowWidth:number, windowHeight:number, horizontalDividers:number, verticalDividers:number,
    dividerWidth:number, templateId:number, panelColoringString:string, streetAddress:string,
    city:string, state:string, zipcode:string, country:string, bottomSashWidth:number, 
    bottomSashHeight:number, status:string}[];
    tempString:string = "";
    windowWidth:number;
    windowHeight:number;
    bottomSashWidth:number;
    bottomSashHeight:number;
    topPanelWidth:number;
    topPanelHeight:number;
    bottomPanelWidth:number;
    bottomPanelHeight:number;
    orderId:number;
    numberTopPanels:number;
    panelColoringString:string[][];
    sortedPanesInformation = new Map();

    
    constructor(orderId:number) {
        this.getOrders().then(() => this.getTemplates().then(() => this.getPanels().then(() => {
            this.lightscreenPanels = [];
            this.orderId = orderId;

            let templateId:number = this.orderData[orderId].templateId;
            let foundTemplate:{ id: number; numberPanelsX: number; numberPanelsY: number; tempString: string; access: string; }[] = this.templateData.filter(function(item) { return item.id == templateId;});
            if(foundTemplate.length > 0) {this.tempString = foundTemplate[0].tempString; console.log("Found template string: -----> " + foundTemplate[0].tempString);}
            else {this.tempString = "";}
            
            let currentTempString:string[] = this.tempString.split(";");
            this.getPanelInfo();
            let tmp:string[] = this.orderData[orderId].panelColoringString.split(";");
            this.panelColoringString = [];
            let totalPaneArea:number = 0;
            let paneAreasPerColor = new Map();
            
            for(let i:number = 0; i < tmp.length; ++i) {this.panelColoringString.push(tmp[i].split(","));}
            // Checking to see if this order can be done
            for(let i:number = 0; i < currentTempString.length; ++i) {
                let currentPanelString:string[] = currentTempString[i].split(",");
                let currentSVG:SVGTemplate = new SVGTemplate(this.panelData[Number(currentPanelString[0])][Number(currentPanelString[1])].d);
                if(Math.abs(currentSVG.width - 320) > .5 || Math.abs(currentSVG.height - 320) > .5) {
                    console.log("This order can't be done because some of the panels have not been converted to lineart.");
                    return;
                }
            }

            // Arrays to collect complete panels
            let panelsDone:string[] = [];
            for(let i:number = 0; i < currentTempString.length; ++i) {
                let tmpPaneAreas = new Map();
                let currentPanelString:string[] = currentTempString[i].split(",");
                let currentSVG:SVGTemplate = new SVGTemplate(this.panelData[Number(currentPanelString[0])][Number(currentPanelString[1])].d);
                currentSVG.numberRotations = Number(currentPanelString[2]);
                currentSVG.flipped = Number(currentPanelString[3]) == 1 ? true : false;
                currentSVG.paneColorString = this.panelColoringString[i];

                if(process.argv[2] && process.argv[2] == "-STLS") {
                    // Checking whether panel has been generated already
                    if(panelsDone.includes(currentPanelString[0] + "," + currentPanelString[1] + "," + currentSVG.flipped + "," + currentSVG.width + "," + currentSVG.height)) {continue;}
                    else {panelsDone.push(currentPanelString[0] + "," + currentPanelString[1] + "," + currentSVG.flipped + "," + currentSVG.width + "," + currentSVG.height);}
                    
                    if(i < this.numberTopPanels) {
                        currentSVG.getLineartFileText(this.topPanelWidth, this.topPanelHeight, 3, 3, "panelFile"+i+"_fullWidth");
                        currentSVG.getLineartFileText(this.topPanelWidth, this.topPanelHeight, 3, 1, "panelFile"+i+"_wellWidth");
                        for(let j:number = 0; j <= 3; ++j) {currentSVG.getLineartFileText(this.topPanelWidth, this.topPanelHeight, 3-((j+1)*.4), 3-((j+1)*.4), "panelFile"+i+"_topPiece"+j);}
                    }
                    else {
                        currentSVG.getLineartFileText(this.bottomPanelWidth, this.bottomPanelHeight, 3, 3, "panelFile"+i+"_fullWidth");
                        currentSVG.getLineartFileText(this.bottomPanelWidth, this.bottomPanelHeight, 3, 1, "panelFile"+i+"_wellWidth");
                        for(let j:number = 0; j <= 3; ++j) {currentSVG.getLineartFileText(this.bottomPanelWidth, this.bottomPanelHeight, 3-((j+1)*.4), 3-((j+1)*.4), "panelFile"+i+"_topPiece"+j);}
                    }

                    // Doing the final svg to stl conversion
                    let options:Options = {
                        args: [String(i < this.numberTopPanels ? this.topPanelWidth : this.bottomPanelWidth), String(i < this.numberTopPanels ? this.topPanelHeight : this.bottomPanelHeight), "panelFile"+i, String(currentSVG.numberRotations)]
                    };
            
                    PythonShell.run('svgSTLConversion.py', options, function (err, results) {
                        if (err) throw err;
                        // results is an array consisting of messages collected during execution
                        console.log('results: %j', results);
                    });
                }
                else if(process.argv[2] && process.argv[2] == "-PANES") {
                    if(i < this.numberTopPanels) {currentSVG.getLineartPanesFileText(this.topPanelWidth, this.topPanelHeight, "paneFile"+i, this.sortedPanesInformation);}
                    else {currentSVG.getLineartPanesFileText(this.bottomPanelWidth, this.bottomPanelHeight, "paneFile"+i, this.sortedPanesInformation);}
                }
                else {
                    if(i < this.numberTopPanels) {
                        totalPaneArea += currentSVG.getPanelPanesArea(this.topPanelWidth/300, this.topPanelHeight/300);
                        tmpPaneAreas = currentSVG.getPanelPanesAreaPerColor(this.topPanelWidth/300, this.topPanelHeight/300);
                    }
                    else {
                        totalPaneArea += currentSVG.getPanelPanesArea(this.bottomPanelWidth/300, this.bottomPanelHeight/300);
                        tmpPaneAreas = currentSVG.getPanelPanesAreaPerColor(this.bottomPanelWidth/300, this.bottomPanelHeight/300);
                    }
                }
                console.log("Right here Logan --> " + Array.from(tmpPaneAreas.entries()));
                let keys:string[] = Array.from(tmpPaneAreas.keys());
                for(let keyNum:number = 0; keyNum < keys.length; ++keyNum) {
                    if(paneAreasPerColor.get(keys[keyNum]) == undefined) {paneAreasPerColor.set(keys[keyNum], tmpPaneAreas.get(keys[keyNum]));}
                    else {paneAreasPerColor.set(keys[keyNum], paneAreasPerColor.get(keys[keyNum]) + tmpPaneAreas.get(keys[keyNum]));}
                }
                this.lightscreenPanels.push(currentSVG);
        
                
            }
            this.sortPanes();
            console.log("Pane Area: " + totalPaneArea + "mm^2");
            console.log("Final pane area by color: " + Array.from(paneAreasPerColor.entries()).join(";"));
            console.log(this.orderData[orderId]);
        })));
        // a.then(value => {
        //     // let tempStrings = ["20,0,0,1;20,1,0,1;20,0,0,1;20,1,0,0;20,0,0,0", 
        //     // "17,6,0,0;17,4,2,0;17,6,0,1;17,4,1,0;17,0,0,0;17,4,3,0;17,4,1,0;17,0,0,0;17,4,3,0;17,7,0,0;17,4,0,0;17,7,0,1",
        //     // "16,8,0,0;16,5,0,0;16,4,0,0;16,6,0,0;16,7,0,0;16,6,0,1;16,5,0,0;16,8,0,0"];
        //     this.panelData = [];
        //     for(let i:number = 0; i < 22; ++i) {this.panelData.push([]);}
        //     for(let i:number = 0; i < value.length; ++i) {
        //         let tmp:{id:number, name:string, d:string} = {id:value[i][1], name:value[i][3], d:value[i][4]};
        //         this.panelData[value[i][1]].push(tmp);
        //     }
        //     //let currentTempString:string[] = this.tempStrings[orderId].split(";");

        //     // for(let i:number = 0; i < this.tempStrings.length; ++i) {
        //     //     let tmpString:string[] = this.tempStrings[i].split(";");
        //     //     let panels:string[] = [];
        
        //     //     console.log(tmpString);
        //     // }

        //   }).catch(err => {
        //     console.log(err);
        // });
        // console.log(this.panelData);

    }

    convertNumber(num:number, unit:string):number {
        if(unit == "mm" || unit == "'mm'") {return num;}
        else if(unit == "inches") {return num*25.4;}
        else {return num*10;};
    }

    sortPanes():void {
        //
        for(let currentKey of Array.from(this.sortedPanesInformation.keys())) {
            console.log(currentKey);
            let paths:string = "";
            let currentPanesArray = this.sortedPanesInformation.get(currentKey);
            let currentStartingPoint = [0,0];
            for(let i:number = 0; i < currentPanesArray.length; ++i) {
                let tmp:{paneHex:string, paneWidth:number, paneHeight:number, d:string, transform:string} = currentPanesArray[i];
                let dArray = tmp.d.trim().split(" ");
                dArray[0] = "M";
                dArray[1] = String(currentStartingPoint[0]);
                dArray[2] = String(currentStartingPoint[1]);
                currentStartingPoint[0] += 2*tmp.paneWidth + 1;
                let finalD = dArray.join(" ");
                paths += `\n
                <path
                    id="rect` + i + `"
                    style="fill:#` + tmp.paneHex + `;stroke-width:0.999999"
                    d="` + finalD + `"
                    transform="` + tmp.transform + `" /> \n
                `;
            } 

        let svgSizeInfo:string = "\nwidth='"+609+"mm'\n" +
            "height='"+609+"mm'\n" +
            "viewBox='"+0 + " " + 0 + " " + 609 + " " + 609 + "'\n";
        
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
    ` + 
    paths + 
`     
</svg>
`

        let options:Options = {
            args: [String(609), String(609), fullFileText, "paneFile_"+currentKey]
        };

        PythonShell.run('svgFileGenerator.py', options, function (err, results) {
            if (err) throw err;
            // results is an array consisting of messages collected during execution
            console.log('results: %j', results);
        });
        }
    }

    getPanelInfo():void {
        this.windowWidth = this.convertNumber(this.orderData[this.orderId].windowWidth, this.orderData[this.orderId].unitChoice);
        this.windowHeight = this.convertNumber(this.orderData[this.orderId].windowHeight, this.orderData[this.orderId].unitChoice);
        this.bottomSashWidth = this.convertNumber(this.orderData[this.orderId].bottomSashWidth, this.orderData[this.orderId].unitChoice);
        this.bottomSashHeight = this.convertNumber(this.orderData[this.orderId].bottomSashHeight, this.orderData[this.orderId].unitChoice);
        let verticalDividers:number = this.orderData[this.orderId].verticalDividers;
        let horizontalDividers:number = this.orderData[this.orderId].horizontalDividers;
        let dividerWidth:number = this.convertNumber(this.orderData[this.orderId].dividerWidth, this.orderData[this.orderId].unitChoice);
        let selectedDividerType:string = this.orderData[this.orderId].selectedDividerType;
        console.log(this.windowHeight + "  " + this.windowWidth);
        // Not a double hung
        if(this.bottomSashWidth <= 0 && this.bottomSashHeight <= 0) {
            if(selectedDividerType == "nodiv") {
                this.topPanelWidth = this.windowWidth / (Math.ceil(this.windowWidth/386));
                this.topPanelHeight = this.windowHeight / (Math.ceil(this.windowHeight/386));
            }
            else if(selectedDividerType == "embeddeddiv") {
                this.topPanelWidth = this.windowWidth / (verticalDividers+1);
                this.topPanelHeight = this.windowHeight / (horizontalDividers+1);
            }
            else if(selectedDividerType == "raiseddiv") {
                this.topPanelWidth = ((this.windowWidth - (verticalDividers*dividerWidth)) / (verticalDividers+1));
                this.topPanelHeight = ((this.windowHeight - (horizontalDividers*dividerWidth)) / (horizontalDividers+1));
            }
            this.numberTopPanels = this.tempString.split(";").length;
            console.log("top panel width: " + this.topPanelWidth);
        }
        else {
            if(selectedDividerType == "nodiv") {
                this.topPanelWidth = this.windowWidth / (Math.ceil(this.windowWidth/386));
                this.topPanelHeight = this.windowHeight / (Math.ceil(this.windowHeight/386));
                this.bottomPanelWidth = this.bottomSashWidth / (Math.ceil(this.bottomSashWidth/386));
                this.bottomPanelHeight = this.bottomSashHeight / (Math.ceil(this.bottomSashHeight/386));
            }
            else if(selectedDividerType == "embeddeddiv" || selectedDividerType == "'embeddeddiv'") {
                this.topPanelWidth = this.windowWidth / (verticalDividers+1);
                this.topPanelHeight = this.windowHeight / (horizontalDividers+1);
                this.bottomPanelWidth = this.bottomSashWidth / (verticalDividers+1);
                this.bottomPanelHeight = this.bottomSashHeight / (horizontalDividers+1);
            }
            else if(selectedDividerType == "raiseddiv") {
                this.topPanelWidth = ((this.windowWidth - (verticalDividers*dividerWidth)) / (verticalDividers+1));
                this.topPanelHeight = ((this.windowHeight - (horizontalDividers*dividerWidth)) / (horizontalDividers+1));
                this.bottomPanelWidth = ((this.bottomSashWidth - (verticalDividers*dividerWidth)) / (verticalDividers+1));
                this.bottomPanelHeight = ((this.bottomSashHeight - (horizontalDividers*dividerWidth)) / (horizontalDividers+1));
            }
            let numberPanelsX:number = Math.floor(this.windowWidth / this.topPanelWidth);
            let numberPanelsY:number = Math.floor(this.windowHeight / this.topPanelHeight);
            this.numberTopPanels = numberPanelsX * numberPanelsY;
        }

        // Start of new optimized algororithm code
        // Getting all possible widths for top
        let topPanelWidths:number[] = [];
        let reductionFactor:number = 1;
        while(this.topPanelWidth / reductionFactor >= 100) {
            if(this.topPanelWidth/reductionFactor >= 100 && this.topPanelWidth/reductionFactor <= 386) {
            if((this.windowWidth-(verticalDividers))/(this.topPanelWidth/reductionFactor) <= ((this.bottomSashWidth > 0 && this.bottomSashHeight > 0) ? 3 : 6)) {
                topPanelWidths.push(this.topPanelWidth/reductionFactor);
            }
            }
            ++reductionFactor;
        }

        // Getting all possible heights for top
        let topPanelHeights:number[] = [];
        reductionFactor = 1;
        while(this.topPanelHeight / reductionFactor >= 100) {
            if(this.topPanelHeight/reductionFactor >= 100 && this.topPanelHeight/reductionFactor <= 386) {
            if((this.windowHeight-(dividerWidth*horizontalDividers))/(this.topPanelHeight/reductionFactor) <= ((this.bottomSashWidth > 0 && this.bottomSashHeight > 0) ? 3 : 6)) {
                topPanelHeights.push(this.topPanelHeight/reductionFactor);
            }
            }
            ++reductionFactor;
        }

        // Getting the best top width and height
        [this.topPanelWidth, this.topPanelHeight] = this.getOptimalWidthHeight(topPanelWidths, topPanelHeights);
        
        if(!(this.bottomSashWidth <= 0 && this.bottomSashHeight <= 0)) {
            // Getting all possible widths for bottom
            let bottomPanelWidths:number[] = [];
            reductionFactor = 1;
            while(this.bottomPanelWidth / reductionFactor >= 100) {
                if(this.bottomPanelWidth/reductionFactor >= 100 && this.bottomPanelWidth/reductionFactor <= 386) {
                if((this.bottomSashWidth-(dividerWidth*verticalDividers))/(this.bottomPanelWidth/reductionFactor) <= ((this.bottomSashWidth > 0 && this.bottomSashHeight > 0) ? 3 : 6)) {
                    bottomPanelWidths.push(this.bottomPanelWidth/reductionFactor);
                }
                }
                ++reductionFactor;
            }
            

            // Getting all possible heights for bottom
            let bottomPanelHeights:number[] = [];
            reductionFactor = 1;
            while(this.bottomPanelHeight / reductionFactor >= 100) {
                if(this.bottomPanelHeight/reductionFactor >= 100 && this.bottomPanelHeight/reductionFactor <= 386) {
                if((this.bottomSashHeight-(dividerWidth*horizontalDividers))/(this.bottomPanelHeight/reductionFactor) <= ((this.bottomSashWidth > 0 && this.bottomSashHeight > 0) ? 3 : 6)) {
                    bottomPanelHeights.push(this.bottomPanelHeight/reductionFactor);
                }
                }
                ++reductionFactor;
            }

            [this.bottomPanelWidth, this.bottomPanelHeight] = this.getOptimalWidthHeight(bottomPanelWidths, bottomPanelHeights);
        }
        let numberPanelsX:number = Math.floor((this.windowWidth) / this.topPanelWidth);
        let numberPanelsY:number = Math.floor((this.windowHeight) / this.topPanelHeight);
        let numberBottomPanelsX:number = 0;
        let numberBottomPanelsY:number = 0;
        if(!(this.bottomSashWidth <= 0 && this.bottomSashHeight <= 0)) {
            numberBottomPanelsX = Math.floor((this.bottomSashWidth) / this.bottomPanelWidth);
            numberBottomPanelsY = Math.floor((this.bottomSashHeight) / this.bottomPanelHeight);
            this.numberTopPanels = numberPanelsX * numberPanelsY;
        }
        
    }

    getOptimalWidthHeight(widths:number[], heights:number[]) {
        // Getting optimal widths and heights by checking every combination for top panels
        let bestCombo:number[] = [0, 0];
        let widthHeightRatio = widths[0] / heights[0];
        let acceptableCombos:number[][] = [];
        for(let widthIndex:number = 0; widthIndex < widths.length; ++widthIndex) {
            for(let heightIndex:number = 0; heightIndex < heights.length; ++heightIndex) {
                if(Math.abs(1 - widths[widthIndex] / heights[heightIndex]) <= Math.abs(1 - widthHeightRatio)) {
                    // Met the requirements within a 6x6 template of ratio .75-1.33
                    if((widths[widthIndex] / heights[heightIndex]) <= 1.33 && (widths[widthIndex] / heights[heightIndex]) >= .75) {
                        acceptableCombos.push([widthIndex, heightIndex]);
                    }
                    bestCombo = [widthIndex, heightIndex];
                    widthHeightRatio = widths[widthIndex] / heights[heightIndex];
                }
            }
        }
        let width = acceptableCombos.length > 0 ? widths[acceptableCombos[0][0]] : widths[bestCombo[0]];
        let height = acceptableCombos.length > 0 ? heights[acceptableCombos[0][1]] : heights[bestCombo[1]];
        
        return [width, height];
      }

    async getTemplates() {
        try {
          // 👇️ const response: Response
          const response = await fetch('https://backend-dot-lightscreendotart.uk.r.appspot.com/templates', {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          });
      
          if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
          }
      
          // 👇️ const result: GetUsersResponse
          const result = (await response.json());

          let tempData = JSON.parse(JSON.stringify(result));
          for(let i:number = 0; i < tempData.length; ++i) {
            let tmp:{id:number, numberPanelsX:number, numberPanelsY:number, tempString:string, access:string} = {id:Number(tempData[i][0]), numberPanelsX:Number(tempData[i][1]), numberPanelsY:Number(tempData[i][2]), tempString:tempData[i][3], access:tempData[i][4]};
            this.templateData.push(tmp);
          }
          //console.log('result is: ', JSON.stringify(result, null, 4));
        //   return result;

            return JSON.parse(JSON.stringify(result));
        } catch (error) {
          if (error instanceof Error) {
            console.log('error message: ', error.message);
            return error.message;
          } else {
            console.log('unexpected error: ', error);
            return 'An unexpected error occurred';
          }
        }
    }
    
    async getPanels() {
        try {
          // 👇️ const response: Response
          const response = await fetch('https://backend-dot-lightscreendotart.uk.r.appspot.com/panels', {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          });
      
          if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
          }
      
          // 👇️ const result: GetUsersResponse
          const result = (await response.json());
      
          //console.log('result is: ', JSON.stringify(result, null, 4));
        //   return result;
        // ***** Populating panel data ********
        this.panelData = [];
        let value = JSON.parse(JSON.stringify(result));
        for(let i:number = 0; i < 100; ++i) {this.panelData.push(new Array(20));}
        for(let i:number = 0; i < value.length; ++i) {
            let tmp:{id:number, name:string, d:string} = {id:Number(value[i][1]), name:value[i][3], d:value[i][4]};
            this.panelData[value[i][1]][Number(value[i][2])] = tmp;
        }
            return JSON.parse(JSON.stringify(result));
        } catch (error) {
          if (error instanceof Error) {
            console.log('error message: ', error.message);
            return error.message;
          } else {
            console.log('unexpected error: ', error);
            return 'An unexpected error occurred';
          }
        }
    }
    
    async getOrders() {
        try {
          // 👇️ const response: Response
          const response = await fetch('https://backend-dot-lightscreendotart.uk.r.appspot.com/orders', {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          });
      
          if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
          }
      
          // 👇️ const result: GetUsersResponse
          const result = (await response.json());
      
          //console.log('result is: ', JSON.stringify(result, null, 4));
        //   return result;
        let value = JSON.parse(JSON.stringify(result));
        this.orderData = [];
        for(let i:number = 0; i < value.length; ++i) {
            let tmp:{id:number, userEmail:string, selectedDividerType:string, unitChoice:string, 
            windowWidth:number, windowHeight:number, horizontalDividers:number, verticalDividers:number,
            dividerWidth:number, templateId:number, panelColoringString:string, streetAddress:string,
            city:string, state:string, zipcode:string, country:string, bottomSashWidth:number, 
            bottomSashHeight:number, status:string} = 
                {id:Number(value[i][0]), userEmail:value[i][1], selectedDividerType:value[i][2], unitChoice:value[i][3], 
                windowWidth:Number(value[i][4]), windowHeight:Number(value[i][5]), horizontalDividers:Number(value[i][6]), verticalDividers:Number(value[i][7]),
                dividerWidth:Number(value[i][8]), templateId:Number(value[i][9]), panelColoringString:value[i][10], streetAddress:value[i][11],
                city:value[i][12], state:value[i][13], zipcode:value[i][14], country:value[i][15], bottomSashWidth:Number(value[i][16]), 
                bottomSashHeight:Number(value[i][17]), status:value[i][18]};

            this.orderData.push(tmp);
        }
            return JSON.parse(JSON.stringify(result));
        } catch (error) {
          if (error instanceof Error) {
            console.log('error message: ', error.message);
            return error.message;
          } else {
            console.log('unexpected error: ', error);
            return 'An unexpected error occurred';
          }
        }
    }
}

// 1.7A 01
//let p:string = "M -3.1667375,34.1668 V 262.16653 H 214.8334 V 34.1668 Z m 8.0003398,8.000337 H 44.833642 V 206.16692 H 4.8336023 Z m 47.9998267,0 H 101.83316 V 173.16676 l -48.999731,33.00016 v -33.00016 z m 57.000071,0 h 49.00028 V 173.16676 h -5.6e-4 v 33.00016 L 109.8335,173.16676 Z m 57.00007,0 h 40.00004 V 206.16692 h -40.00004 z m -61.00024,137.999503 52.9999,34.00006 v 40.00004 H 52.833429 V 214.1667 Z M 4.8170641,214.1667 H 44.816553 v 40.00004 H 4.8170641 Z m 162.0159559,0 h 40.00004 v 40.00004 h -40.00004 z";

// 1.7A 02
//let p:string = "M -1.6548343,28.119286 V 256.1188 H 216.3453 V 28.119286 Z M 54.345366,36.118797 H 103.34496 V 248.11929 H 54.345366 Z m 56.999614,0 H 160.3451 V 84.177878 117.11902 248.11929 H 111.34498 V 117.11902 Z M 6.3451957,36.119326 H 46.345346 V 248.11929 H 6.3451957 Z m 161.9999243,0 h 40.00015 V 248.11929 h -40.00015 z";

// 1.7A 03
//let p:string = "M -11.96875 129.13477 L -11.96875 990.86523 L 811.96875 990.86523 L 811.96875 129.13477 L -11.96875 129.13477 z M 199.68555 159.36914 L 600.31445 159.36914 L 600.31445 310.55078 L 600.31445 310.55273 L 400 439.05664 L 199.68555 310.55273 L 199.68555 310.55078 L 199.68555 159.36914 z M 630.55273 159.36914 L 781.73242 159.36914 L 781.73242 960.63086 L 630.55273 960.63086 L 630.55273 159.36914 z M 18.261719 159.45508 L 169.44336 159.45508 L 169.44336 960.71289 L 18.261719 960.71289 L 18.261719 159.45508 z M 199.68555 341.01172 L 384.88086 465.51172 L 384.88086 465.51367 L 384.88086 960.62891 L 199.68555 960.62891 L 199.68555 465.51367 L 199.68555 465.51172 L 199.68555 341.01172 z M 600.31445 341.01172 L 600.31445 465.51172 L 600.31445 465.51367 L 600.31445 960.62891 L 415.11914 960.62891 L 415.11914 465.51367 L 415.11914 465.51172 L 600.31445 341.01172 z";

// 1.7A 04
//let p:string = "M -3.1667317,34.166907 V 262.16642 H 214.8334 V 34.166907 Z M 52.833467,42.166419 H 158.83319 v 40.000142 5.15e-4 L 105.83333,116.16707 52.833467,82.167076 v -5.15e-4 z M 4.8338133,42.166935 H 44.833438 V 206.16674 H 4.8338133 Z m 161.9999267,0 h 39.99963 V 206.16674 H 166.83374 Z M 52.833467,90.225502 101.83306,123.16664 v 5.2e-4 130.99924 H 52.833467 v -130.99924 -5.2e-4 z m 105.999723,0 v 32.941138 5.2e-4 130.99924 H 109.8336 v -130.99924 -5.2e-4 h 5.2e-4 z M 4.8338133,214.16677 H 44.833438 v 40.00014 H 4.8338133 Z m 161.9999267,0 h 39.99963 v 40.00014 h -39.99963 z";

// 1.7A 05
//let p:string = "M 47.472659,20.90234 V 437.6543 H 369.23438 804.38282 V 20.90234 H 803.88086 369.23438 198.6543 Z m 1.003907,1.00391 H 198.6543 v 124.74609 0.01 c -36.63661,5.47922 -64.73828,37.07856 -64.73828,75.24023 0,2.29421 0.10776,4.56405 0.30664,6.80665 l -35.66211,0.0273 -50.083984,0.0391 z m 151.181644,0 H 368.73243 V 435.61523 L 256.45313,282.16602 c 18.02555,-13.9163 29.64062,-35.73522 29.64062,-60.26368 0,-42.01768 -34.07606,-76.08398 -76.09375,-76.08398 -3.50848,0 -6.95938,0.24328 -10.34179,0.70313 z m 170.07812,0 H 482.11914 V 436.65039 H 369.73633 Z m 113.38672,0 h 169.07422 v 124.19141 c -2.14399,-0.18154 -4.31107,-0.2793 -6.50195,-0.2793 -0.65653,0 -1.3123,0.009 -1.96485,0.0254 -41.11032,1.0417 -74.12109,34.69743 -74.12109,76.05859 0,24.50995 11.59357,46.31471 29.59375,60.23243 l -63.66211,84.1953 -52.41797,69.32812 z m 170.07812,0 h 150.17774 v 206.86914 h -81.9043 c 0.20282,-2.26416 0.3125,-4.55621 0.3125,-6.87305 0,-39.48624 -30.09409,-71.94826 -68.59179,-75.71679 a 0.49999937,0.49999937 0 0 0 0.006,-0.0566 z M 210,146.81445 c 41.47725,0 75.09571,33.61064 75.09571,75.08789 C 285.09571,263.3796 251.47725,297 210,297 c -41.47725,0 -75.08789,-33.6204 -75.08789,-75.09766 0,-0.64808 0.007,-1.29335 0.0234,-1.9375 1.02776,-40.58101 34.23529,-73.15039 75.06445,-73.15039 z m 435.69532,0 c 41.47725,0 75.0957,33.61064 75.0957,75.08789 0,41.47726 -33.61845,75.09766 -75.0957,75.09766 -41.47722,0 -75.08985,-33.6204 -75.08985,-75.09766 0,-0.64808 0.009,-1.29335 0.0254,-1.9375 1.02776,-40.58101 34.23532,-73.15039 75.06446,-73.15039 z M 134.3125,229.71289 c 3.91112,38.35003 36.30666,68.2832 75.6875,68.2832 17.12872,0 32.93778,-5.66378 45.65625,-15.21875 L 368.2461,436.65039 H 48.476566 V 229.7793 l 55.990234,-0.043 z m 587.07032,0.0664 h 81.99609 v 206.87109 h -319.75 L 599.99805,282.74219 c 12.72461,9.57514 28.54863,15.2539 45.69727,15.2539 39.35803,0 71.74485,-29.89873 75.6875,-68.21679 z";

/*******  New scaling test d  **********/
// let p:string = "M 27.867852,184.28052 V 294.28053 H 112.88764 227.86785 V 184.28052 H 227.73521 112.88764 67.814902 z m 0.26527,0.26498 h 39.68178 v 32.92623 0.003 c -9.68057,1.44621 -17.10594,9.78673 -17.10594,19.85935 0,0.60555 0.0285,1.20466 0.081,1.79659 l -9.42308,0.007 -13.23379,0.0103 z m 39.94704,0 H 112.755 V 293.74233 L 83.087212,253.24002 c 4.76293,-3.67316 7.832,-9.43217 7.832,-15.90636 0,-11.0904 -9.00399,-20.08206 -20.10641,-20.08206 -0.92706,0 -1.8389,0.0642 -2.73264,0.18559 z m 44.940108,0 h 29.69515 v 109.47005 h -29.69515 z m 29.96041,0 h 44.67484 v 32.77982 c -0.56651,-0.0479 -1.13913,-0.0737 -1.71801,-0.0737 -0.17349,0 -0.34675,0.002 -0.51919,0.007 -10.86266,0.27496 -19.58517,9.15825 -19.58517,20.07536 0,6.4693 3.0634,12.22458 7.81963,15.89811 l -16.82159,22.22301 -13.85051,18.29889 z m 44.94011,0 h 39.68177 v 54.60227 h -21.64175 c 0.0536,-0.59761 0.0826,-1.20259 0.0826,-1.81411 0,-10.42223 -7.95181,-18.99045 -18.12414,-19.98514 z M 70.812802,217.51451 c 10.95962,0 19.8427,8.8714 19.8427,19.81915 0,10.94776 -8.88308,19.82172 -19.8427,19.82172 -10.95963,0 -19.84064,-8.87396 -19.84064,-19.82172 0,-0.17106 0.002,-0.34137 0.006,-0.5114 0.27156,-10.71119 9.04606,-19.30775 19.83444,-19.30775 z m 115.124708,0 c 10.95962,0 19.8427,8.8714 19.8427,19.81915 0,10.94776 -8.88308,19.82172 -19.8427,19.82172 -10.95963,0 -19.84064,-8.87396 -19.84064,-19.82172 0,-0.17106 0.002,-0.34137 0.006,-0.5114 0.27156,-10.71119 9.04606,-19.30775 19.83444,-19.30775 z M 50.813732,239.39522 c 1.03344,10.12234 9.59338,18.02308 19.99907,18.02308 4.52595,0 8.70322,-1.49493 12.06384,-4.01693 L 112.6265,294.01555 H 28.133122 v -54.6028 l 14.79441,-0.0113 z m 155.122848,0.0175 h 21.66598 v 54.6028 h -84.48821 l 30.74847,-40.62346 c 3.36225,2.52732 7.54346,4.02621 12.07469,4.02621 10.39965,0 18.95728,-7.89165 19.99907,-18.00555 z";
// Order 54 d: 
//let p:string = "M 0,0 V 0.051 319.9998 H 320 V 3e-4 Z m 0.1012,0.1018 h 159.5381 c -9.9099,8.6083 -18.0993,23.8364 -24.0048,41.8455 -1.199,3.6565 -2.2988,7.4316 -3.3047,11.2851 C 126.9305,51.916 121.1745,51.45 115.3805,51.896 v 0 C 97.961,53.2368 80.2008,62.8232 70.777,82.349 c -5.5575,0.013 -16.2582,0.039 -32.3163,0.074 -9.9004,0.022 -19.7377,0.043 -26.9782,0.055 -3.6203,0.01 -6.5919,0.011 -8.5959,0.012 -1.002,0 -1.7632,0 -2.2422,0 -0.2395,0 -0.4082,0 -0.5018,0 -0.024,-3e-4 -0.031,-10e-5 -0.041,0 z m 159.6879,0 h 0.4258 c 9.9237,8.5747 18.1378,23.8269 24.0564,41.8765 5.9219,18.0591 9.547,38.9188 10.2971,58.6915 0.7501,19.7727 -1.376,38.4601 -6.9489,52.172 -2.7866,6.8559 -6.433,12.4674 -11.0118,16.3514 -4.5788,3.8841 -10.0875,6.0407 -16.6057,5.9903 v 0.051 0 -0.051 c -6.5183,0.05 -12.0264,-2.1062 -16.6052,-5.9903 -4.5788,-3.884 -8.2273,-9.4955 -11.0138,-16.3514 -5.5729,-13.7119 -7.6974,-32.3993 -6.9473,-52.172 0.75,-19.7727 4.3752,-40.6324 10.297,-58.6915 5.9188,-18.0496 14.1332,-33.3018 24.0569,-41.8765 z m 0.5757,0 h 159.5354 v 82.3319 c 0,0 -0.01,0 -0.014,0 -0.09,1e-4 -0.2559,2e-4 -0.4925,0 -0.4732,0 -1.2283,0 -2.2262,0 -1.9958,0 -4.9623,-0.01 -8.5803,-0.01 -7.2359,-0.01 -17.0802,-0.024 -26.9901,-0.037 -16.0926,-0.022 -26.8518,-0.037 -32.3986,-0.045 C 238.1992,59.5794 215.8796,50.2791 195.9806,51.8536 v 0 c -2.8353,0.2244 -5.6219,0.6691 -8.3193,1.3276 -1.0024,-3.8357 -2.0981,-7.5936 -3.2918,-11.2339 C 178.4641,23.9385 170.2749,8.7102 160.3652,0.1018 Z m 39.9133,51.6821 c 18.6837,-0.01 38.6052,9.4897 48.8079,30.5578 -1.2471,0 -7.3821,-0.01 -7.3836,-0.01 h -0.01 c -1.3973,-0.1973 -2.7515,-0.23 -4.0665,-0.1132 v 0 c -3.9528,0.3512 -7.5503,2.0458 -10.8846,4.6349 -4.4457,3.4522 -8.4278,8.4932 -12.1776,14.0627 -7.4614,11.0819 -14.0095,24.2583 -21.427,31.1914 1.4744,-9.6932 1.9537,-20.3975 1.5347,-31.4421 -0.5979,-15.7629 -3.0268,-32.2099 -6.9846,-47.3862 4.0423,-0.9867 8.2842,-1.4939 12.5926,-1.4955 z m -80.5537,0.047 c 4.3043,0.01 8.5426,0.5142 12.5806,1.4986 -3.9499,15.1622 -6.3738,31.5907 -6.9711,47.3362 -0.4204,11.0826 0.062,21.8232 1.5487,31.5427 -7.4237,-6.9293 -13.9762,-20.1375 -21.4436,-31.2472 C 101.6886,95.3816 97.7075,90.3315 93.2614,86.8717 89.9268,84.2768 86.3292,82.5759 82.3763,82.2229 v 0 c -1.3176,-0.1176 -2.6742,-0.085 -4.0741,0.1132 0,0 -6.156,0.014 -7.4141,0.017 10.1987,-21.0872 30.1401,-30.5426 48.8358,-30.5175 z m 119.9032,30.4256 c 0.6753,0.018 1.361,0.076 2.0573,0.1746 c 0,0 20.0825,0.028 39.9024,0.055 9.9099,0.014 19.7542,0.028 26.9901,0.037 3.618,0 6.5846,0.01 8.5804,0.01 h 2.2262 c 0.1864,2e-4 0.2919,0 0.3881,0 -26.4814,16.7134 -38.8999,43.6781 -58.4285,66.5292 -19.5528,22.8793 -46.2288,41.6418 -101.3023,41.8972 V 175.284 c 6.5191,0.04 12.0394,-2.1272 16.6228,-6.0151 4.5951,-3.8978 8.2504,-9.5243 11.0411,-16.3908 2.4483,-6.0238 4.2306,-13.0033 5.3976,-20.6101 7.4804,-6.9332 14.0466,-20.1764 21.5331,-31.2957 3.7472,-5.5654 7.7231,-10.598 12.1543,-14.039 3.8774,-3.0108 8.1006,-4.8043 12.8276,-4.6767 z m -159.2543,0.01 c 4.7265,-0.1266 8.9484,1.6701 12.8261,4.6876 4.4317,3.4486 8.4102,8.4907 12.1579,14.0663 7.492,11.1461 14.0628,24.4196 21.5486,31.3495 1.1672,7.5692 2.9452,14.5153 5.3831,20.5135 2.7908,6.8665 6.4457,12.4929 11.0407,16.3907 4.5831,3.8877 10.1027,6.0541 16.6212,6.0152 v 15.675 C 104.8546,190.7165 78.1843,171.9683 58.6403,149.1038 39.1189,126.2658 26.7096,99.3116 0.2134,82.5993 c 0.099,0 0.2241,0 0.4289,0 0.4792,0 1.2401,0 2.2423,0 2.004,0 4.9755,2e-4 8.5958,-0.01 7.2405,-0.012 17.0779,-0.033 26.9782,-0.055 19.8006,-0.044 39.8477,-0.094 39.8477,-0.094 c 0.6963,-0.099 1.3815,-0.156 2.0567,-0.1741 z m 239.5269,0.3132 v 237.325 H 160.1044 c 16.7866,-20.8714 27.8646,-42.6861 29.208,-64.485 1.3429,-21.7934 -7.0492,-43.5683 -29.176,-64.3541 55.0379,-0.2747 81.7388,-19.0534 101.293,-41.9344 19.5563,-22.8833 31.974,-49.8596 58.4708,-66.5515 z m -319.799,0.066 c 26.5085,16.691 38.9148,43.6542 58.4626,66.5231 19.5475,22.8686 46.2462,41.6323 101.3178,41.8956 -22.1372,20.7906 -30.5332,42.5684 -29.1904,64.364 1.3426,21.7954 12.418,43.6054 29.2044,64.4767 H 0.1012 Z m 159.907,108.4378 c 22.1561,20.7879 30.5468,42.5472 29.2044,64.331 -1.3421,21.7808 -12.419,43.5901 -29.2126,64.4616 -16.7934,-20.8714 -27.8675,-42.6757 -29.2091,-64.4529 -1.3422,-21.7854 7.052,-43.5475 29.2173,-64.3397 z";
// Order 66 d: let p:string = "M 0,0 V 0.05401914 159.94571 160.0543 320 H 320 V 0 Z M 0.10638463,0.10638463 H 159.94571 V 129.69499 c -2.22275,2.3985 -5.63725,4.47505 -10.71839,6.33237 -1.67938,0.61385 -3.0036,0.61971 -5.0315,0.76839 -2.02529,0.14849 -4.50287,0.2735 -7.29754,0.45255 -5.58939,0.35811 -12.43876,0.94294 -19.01694,2.32503 -6.5784,1.38212 -12.8464,3.59447 -17.26242,6.87917 -4.381147,3.25877 -7.044531,7.27829 -7.282117,13.49321 H 0.10638463 Z m 159.94791537,0 H 319.89417 V 159.94571 h -93.23041 c -0.23775,-6.21458 -2.90111,-10.23511 -7.28211,-13.49376 -4.41602,-3.28471 -10.68458,-5.49705 -17.26298,-6.87917 -6.57817,-1.38209 -13.42702,-1.96693 -19.01639,-2.32503 -2.79468,-0.17905 -5.27282,-0.3013 -7.2981,-0.44979 -2.02791,-0.14869 -3.35156,-0.15507 -5.03094,-0.76895 -5.08154,-1.85744 -8.49619,-3.93638 -10.71894,-6.33512 z M 160.0003,129.78319 c 2.23923,2.4084 5.65714,4.48986 10.73548,6.34614 1.69617,0.62001 3.03762,0.62656 5.06236,0.77501 2.02734,0.14864 4.50214,0.27081 7.29589,0.44979 5.5875,0.35798 12.43253,0.94475 19.00206,2.32503 6.56934,1.38022 12.82492,3.58869 17.22053,6.85823 4.37545,3.25451 7.01953,7.24683 7.24408,13.46069 -0.22329,6.21676 -2.86745,10.21133 -7.24408,13.46675 -4.39561,3.26951 -10.65119,5.47801 -17.22053,6.85822 -6.56953,1.38027 -13.41456,1.96705 -19.00206,2.32503 -2.79376,0.17899 -5.26856,0.30115 -7.29589,0.44979 -2.02472,0.14845 -3.36618,0.155 -5.06236,0.77501 -5.07833,1.85629 -8.49624,3.93553 -10.73548,6.34394 -2.23925,-2.40841 -5.65716,-4.48765 -10.73548,-6.34394 -1.69618,-0.62001 -3.03766,-0.62656 -5.06236,-0.77501 -2.02732,-0.14864 -4.50212,-0.27301 -7.29589,-0.452 -5.58752,-0.35798 -12.43252,-0.94255 -19.00206,-2.32282 -6.56934,-1.38021 -12.82546,-3.59089 -17.22108,-6.86043 -4.375443,-3.25451 -7.018992,-7.24681 -7.243528,-13.46069 v -0.004 c 0.224386,-6.21422 2.867947,-10.20607 7.243528,-13.46069 4.39562,-3.26953 10.65174,-5.47801 17.22108,-6.85823 6.56954,-1.38028 13.41454,-1.96704 19.00206,-2.32502 2.79376,-0.17899 5.26856,-0.30336 7.29589,-0.452 2.02471,-0.14845 3.36619,-0.15501 5.06236,-0.77501 5.07832,-1.85629 8.49623,-3.93553 10.73548,-6.34394 z M 0.10638463,160.0543 H 93.336803 c 0.237597,6.21492 2.900973,10.23501 7.282117,13.49376 4.41602,3.28471 10.68402,5.49705 17.26242,6.87917 6.57819,1.38208 13.42756,1.96692 19.01694,2.32503 2.79466,0.17904 5.27224,0.30351 7.29754,0.452 2.02791,0.14868 3.35213,0.15508 5.0315,0.76894 5.08114,1.85732 8.49564,3.93387 10.71839,6.33237 v 129.5886 H 0.10638463 Z m 226.55737537,0 h 93.23041 V 319.89417 H 160.0543 V 190.30612 c 2.22274,-2.39873 5.63739,-4.47546 10.71894,-6.33292 1.67937,-0.61386 3.00302,-0.62026 5.03094,-0.76894 2.0253,-0.14849 4.50343,-0.27074 7.2981,-0.4498 5.58936,-0.35809 12.43821,-0.94515 19.01639,-2.32723 6.5784,-1.38212 12.84696,-3.59226 17.26298,-6.87696 4.38127,-3.25888 7.04466,-7.28071 7.28211,-13.49597 z";
// let p:string = "M 0,0 V 0.0255 0.051 160.0254 319.9998 H 160 320 V 160.00005 3e-4 L 160,1.5e-4 Z m 0.1012,0.1018 h 79.76905 79.76905 c -4.95495,4.30415 -9.47978,10.26325 -13.50405,17.39745 -4.02428,7.1342 -7.548,15.4435 -10.50075,24.44805 -0.5995,1.82825 -1.1742,3.68615 -1.72476,5.568675 -0.55057,1.882525 -1.07699,3.789675 -1.57994,5.716425 -2.69965,-0.6582 -5.48848,-1.1038 -8.32664,-1.3291 C 121.165,51.678 118.2775,51.673 115.3805,51.896 v 0 0 C 106.67075,52.5664 97.875825,55.2982 90.080363,60.303125 82.2849,65.30805 75.4889,72.5861 70.777,82.349 67.99825,82.3555 63.9337,82.36525 58.556575,82.37775 53.17945,82.39025 46.48975,82.4055 38.4607,82.423 33.5105,82.434 28.576075,82.44475 23.974138,82.45425 19.3722,82.46375 15.10275,82.472 11.4825,82.478 9.67235,82.483 8.024375,82.48575 6.5784375,82.487375 5.1325,82.489 3.8886,82.4895 2.8866,82.49 H 1.7655 0.6444 0.3935 0.1426 c -0.012,-1.5e-4 -0.01975,-1.75e-4 -0.02575,-1.5e-4 -0.006,2.5e-5 -0.01025,10e-5 -0.01525,1.5e-4 l -2e-4,-41.1941 z m 159.6879,0 h 0.2129 0.2129 c 4.96185,4.28735 9.4963,10.244075 13.53011,17.385162 4.03382,7.141088 7.56699,15.466538 10.52629,24.491338 2.96095,9.02955 5.3477,18.75925 7.08798,28.70315 1.74027,9.9439 2.83407,20.102 3.20912,29.98835 0.37505,9.88635 0.031,19.50138 -1.10332,28.3588 -1.13438,8.85743 -3.05913,16.95725 -5.84558,23.8132 -1.3933,3.42795 -3.00155,6.5448 -4.83382,9.29016 -1.83228,2.74536 -3.88858,5.11924 -6.17798,7.06124 -2.2894,1.94205 -4.81127,3.45222 -7.57557,4.47059 -2.7643,1.01836 -5.77103,1.54491 -9.03013,1.51971 v 0.0255 0.0255 0 0 -0.0255 -0.0255 c -3.25915,0.025 -6.26575,-0.50155 -9.02991,-1.51986 -2.76416,-1.01832 -5.28589,-2.52839 -7.57529,-4.47044 -2.2894,-1.942 -4.34623,-4.31587 -6.17901,-7.06124 -1.83279,-2.74536 -3.44154,-5.86221 -4.83479,-9.29016 -2.78645,-6.85595 -4.7108,-14.95578 -5.84477,-23.8132 -1.13398,-8.85743 -1.47758,-18.47245 -1.10253,-28.3588 0.375,-9.88635 1.4688,-20.04445 3.20907,-29.98835 1.74028,-9.9439 4.12703,-19.6736 7.08793,-28.70315 2.9594,-9.0248 6.4927,-17.35025 10.52661,-24.491338 C 150.29322,10.345875 154.82775,4.38915 159.7896,0.1018 l -2.5e-4,0 z m 0.5757,0 h 79.7677 79.7677 V 41.26775 82.4337 h -0.007 -0.007 c -0.045,0 -0.10897,1e-4 -0.19127,1.13e-4 -0.0823,1.2e-5 -0.18293,-1.3e-5 -0.30123,-1.13e-4 h -1.1131 -1.1131 c -0.9979,0 -2.23847,-0.0025 -3.68182,-0.005 -1.44336,-0.0025 -3.08948,-0.005 -4.89848,-0.005 -3.61795,-0.005 -7.888,-0.011 -12.4923,-0.01738 -4.6043,-0.0064 -9.54285,-0.01313 -14.4978,-0.01962 -8.0463,-0.011 -14.75925,-0.02025 -20.15397,-0.02775 C 256.0484,82.35145 251.9719,82.3457 249.1985,82.3417 243.69885,70.96055 235.36912,62.9449 225.92694,57.97135 216.48475,52.9978 205.9301,51.06635 195.9806,51.8536 v 0 0 c -1.41765,0.1122 -2.82313,0.279475 -4.21136,0.501013 C 190.381,52.57615 189.01,52.85195 187.6613,53.1812 187.1601,51.26335 186.63558,49.36495 186.08714,47.490975 185.5387,45.617 184.96635,43.76745 184.3695,41.9473 181.4168,32.9429 177.89315,24.633625 173.86896,17.4994 169.84477,10.365175 165.32005,4.406 160.3652,0.1018 h -2e-4 z m 39.9133,51.6821 c 9.34185,-0.005 18.99315,2.367425 27.58433,7.374613 8.59117,5.007187 16.12222,12.649137 21.22357,23.183187 -0.62355,0 -2.46907,-0.0025 -4.1589,-0.005 -1.68983,-0.0025 -3.22395,-0.005 -3.2247,-0.005 h -0.005 -0.005 c -0.69865,-0.09865 -1.38652,-0.15615 -2.06411,-0.174387 -0.67759,-0.01824 -1.34489,0.0028 -2.00239,0.06119 v 0 0 c -1.9764,0.1756 -3.86397,0.68705 -5.67424,1.478237 -1.81026,0.791188 -3.54321,1.862113 -5.21036,3.156663 -2.22285,1.7261 -4.3298,3.8494 -6.34976,6.237362 -2.01996,2.387963 -3.95294,5.040588 -5.82784,7.825338 -3.7307,5.54095 -7.23307,11.60553 -10.72996,17.1515 -3.49689,5.54597 -6.98829,10.57335 -10.69704,14.0399 0.7372,-4.8466 1.22563,-9.94597 1.47738,-15.21427 0.25175,-5.2683 0.26682,-10.70553 0.0573,-16.22783 -0.29895,-7.88145 -1.05565,-15.933925 -2.23234,-23.913075 -1.17668,-7.97915 -2.77336,-15.884975 -4.75226,-23.473125 2.02115,-0.49335 4.0922,-0.866825 6.19651,-1.117162 2.10431,-0.250338 4.24189,-0.377538 6.39609,-0.378338 l -6.5e-4,10e-5 z m -80.5537,0.047 c 2.15215,0.005 4.2878,0.13355 6.39016,0.3839 2.10237,0.25035 4.17144,0.6225 6.19044,1.1147 -1.97495,7.5811 -3.5684,15.478775 -4.74278,23.449363 -1.17437,7.970587 -1.92967,16.014087 -2.22832,23.886837 -0.21021,5.5413 -0.19471,10.9971 0.0592,16.28251 0.25389,5.28541 0.74617,10.40044 1.48952,15.26019 -3.71185,-3.46465 -7.2059,-8.49903 -10.70541,-14.05595 -3.49952,-5.55693 -7.00449,-11.6364 -10.73819,-17.19125 -1.8752,-2.7898 -3.80808,-5.447225 -5.827913,-7.839675 C 97.59125,90.729075 95.48445,88.6016 93.2614,86.8717 91.594093,85.57426 89.861043,84.50031 88.050707,83.706595 86.240371,82.91288 84.35275,82.3994 82.3763,82.2229 v 0 0 C 81.7175,82.1641 81.04895,82.14285 80.370112,82.161075 79.691275,82.1793 79.00215,82.237 78.3022,82.3361 c 0,0 -1.539,0.0035 -3.235263,0.0074 -1.696262,0.0039 -3.549787,0.0081 -4.178837,0.0096 C 75.98745,71.8095 83.522475,64.17385 92.119625,59.177237 100.71677,54.180625 110.37605,51.82305 119.7239,51.8356 l 2.5e-4,-0.0023 z m 119.9032,30.4256 c 0.33765,0.009 0.6779,0.028 1.02078,0.05707 0.34287,0.02908 0.68837,0.06822 1.03652,0.117525 0,0 5.02063,0.007 12.51874,0.01738 7.49811,0.01037 17.47371,0.02412 27.38366,0.03762 4.95495,0.007 9.8935,0.014 14.4978,0.02038 4.6043,0.0064 8.87435,0.01213 12.4923,0.01663 1.809,0 3.45515,0.0025 4.89853,0.005 1.44337,0.0025 2.68397,0.005 3.68187,0.005 h 1.1131 1.1131 c 0.0932,10e-5 0.16618,10e-5 0.22788,7.5e-5 0.0617,-2.5e-5 0.11212,-7.5e-5 0.16022,-7.5e-5 -13.2407,8.3567 -22.96568,19.27623 -31.82155,30.96296 -8.85588,11.68674 -16.84265,24.14069 -26.60695,35.56624 -9.7764,11.43965 -21.3336,21.8501 -37.33089,29.43256 -15.99728,7.58246 -36.43466,12.33694 -63.97141,12.46464 v -7.83775 -7.83775 c 3.25955,0.02 6.2694,-0.5118 9.03729,-1.53459 2.76789,-1.02278 5.29381,-2.53656 7.58551,-4.48051 2.29754,-1.94891 4.36014,-4.32998 6.1972,-7.08214 1.83705,-2.75216 3.44855,-5.87541 4.8439,-9.30866 1.22415,-3.0119 2.2818,-6.26272 3.17929,-9.71142 0.89749,-3.4487 1.63481,-7.09528 2.21831,-10.89868 3.7402,-3.4666 7.25185,-8.5107 10.76426,-14.07806 3.51242,-5.56736 7.02559,-11.65799 10.76884,-17.21764 1.8736,-2.7827 3.80438,-5.4322 5.82065,-7.81615 2.01628,-2.38395 4.11805,-4.50235 6.33365,-6.22285 1.9387,-1.5054 3.96385,-2.706475 6.0952,-3.51525 2.13135,-0.808775 4.3689,-1.22525 6.7324,-1.16145 l 0.005,-5e-5 z m -159.2543,0.01 c 2.36325,-0.0633 4.60035,0.354225 6.73135,1.164763 2.131,0.810537 4.1559,2.014087 6.09475,3.522837 2.215849,1.724301 4.318399,3.846976 6.335449,6.235526 2.017051,2.38855 3.948601,5.042974 5.822451,7.830774 3.74599,5.57306 7.26169,11.67796 10.77662,17.25583 3.51493,5.57787 7.02908,10.62872 10.77198,14.09367 0.5836,3.7846 1.3199,7.41343 2.21504,10.84587 0.89514,3.43245 1.94911,6.66853 3.16806,9.66763 1.3954,3.43325 3.00683,6.55647 4.84378,9.30861 1.83695,2.75214 3.89942,5.13319 6.19692,7.08209 2.29155,1.94385 4.81722,3.45738 7.58482,4.48008 2.7676,1.0227 5.77713,1.55457 9.03638,1.53512 v 7.8375 7.8375 C 132.40275,190.8404 111.9611,186.0914 95.963488,178.51531 79.965875,170.93922 68.4123,160.53605 58.6403,149.1038 48.8796,137.6848 40.896925,125.23675 32.0424,113.55441 23.187875,101.87208 13.4615,90.95545 0.2134,82.5993 H 0.42785 0.6423 1.76345 2.8846 c 1.002,0 2.245875,5e-5 3.6917875,-0.0012 C 8.0223,82.5969 9.67025,82.5944 11.4804,82.5893 c 3.62025,-0.006 7.889725,-0.01425 12.491675,-0.02375 4.60195,-0.0095 9.536375,-0.02025 14.486525,-0.03125 9.9003,-0.022 19.862225,-0.0455 27.349075,-0.0635 7.48685,-0.018 12.498625,-0.0305 12.498625,-0.0305 0.34815,-0.0495 0.693525,-0.0885 1.036262,-0.117388 C 79.6853,82.294025 80.0254,82.27525 80.363,82.2662 l 0.0052,1.5e-4 z m 239.5269,0.3132 v 118.6625 118.6625 h -79.8979 -79.8979 c 8.3933,-10.4357 15.35945,-21.10723 20.3952,-31.89469 5.03575,-10.78746 8.1411,-21.69086 8.8128,-32.59031 0.67145,-10.8967 -1.09085,-21.78878 -5.78686,-32.5549 -4.69602,-10.76613 -12.32574,-21.4063 -23.38914,-31.7992 27.51895,-0.13735 47.95365,-4.9007 63.95289,-12.48984 15.99923,-7.58914 27.56301,-18.00406 37.34011,-29.44456 9.77815,-11.44165 17.77165,-23.90655 26.63271,-35.59753 8.86107,-11.69097 18.58969,-22.60802 31.83809,-30.95397 z m -319.799,0.066 c 13.25425,8.3455 22.98295,19.25905 31.841563,30.94484 8.858612,11.68578 16.847137,24.14381 26.621037,35.57826 9.77375,11.4343 21.3353,21.84237 37.337363,29.42479 16.002067,7.58241 36.444637,12.33916 63.980437,12.47081 -11.0686,10.3953 -18.7019,21.0374 -23.4002,31.80512 -4.6983,10.76773 -6.4616,21.66108 -5.7902,32.55888 0.6713,10.8977 3.7758,21.79905 8.81078,32.58489 5.03497,10.78583 12.00042,21.45616 20.39362,31.89181 H 79.9984 0.1012 l 0,-118.6297 z m 159.907,108.4378 c 11.07805,10.39395 18.71475,21.03075 23.41414,31.79204 4.69939,10.76128 6.46146,21.64706 5.79026,32.53896 -0.67105,10.8904 -3.7758,21.78792 -8.81199,32.57179 -5.03618,10.78386 -12.00381,21.45406 -20.40061,31.88981 -8.3967,-10.4357 -15.36357,-21.10463 -20.39897,-31.88678 -5.0354,-10.78215 -8.13933,-21.67752 -8.81013,-32.56612 -0.6711,-10.8927 1.0919,-21.77958 5.79334,-32.5423 4.70144,-10.76273 12.34131,-21.4013 23.42396,-31.7974 z";
// let p:string = "M 20.426025,2.38125 C 23.601685,-0.791975 27.616655,0 32.067685,0 h 26.987505 92.86875 25.4 c 2.73368,0 7.90073,-0.93599 10.31875,0.271912 1.70154,0.849948 4.44024,2.353839 5.13213,4.226004 0.84534,2.28817 0.13837,5.696533 0.47201,8.202084 0.44159,3.316394 2.06137,6.292824 3.92774,8.995834 2.94402,4.26376 6.7236,7.766578 10.1227,11.641668 1.57215,1.79229 3.59648,3.54515 4.45426,5.82083 2.26351,6.00472 1.89997,12.28143 2.42967,18.52084 0.18679,2.20106 2.40215,2.98423 2.29076,5.55625 -0.69003,15.91998 -9.37022,29.34176 -15.21592,43.656248 -3.24432,7.94464 -4.41087,16.97778 -7.53269,24.87057 -0.68368,1.72879 -2.92523,2.08306 -3.46287,3.72904 -0.70379,2.15397 -0.22833,5.69198 -0.0169,7.91289 0.32491,3.41392 0.24474,6.89795 0.64982,10.31875 0.26961,2.27806 1.0533,7.20143 -0.0831,9.23184 -0.70776,1.26471 -2.61911,1.50813 -3.67321,2.46618 -4.12936,3.75391 -7.00326,5.32898 -12.72355,4.51327 -1.31657,-0.18786 -3.05832,-0.18839 -4.03119,-1.21021 -2.42756,-2.54979 -3.05806,-7.02363 -4.43574,-10.23858 -2.93185,-6.84212 -6.23941,-13.62683 -9.90151,-20.10833 -5.27843,-9.34191 -11.0019,-18.41527 -17.09234,-27.25209 -3.73063,-5.41232 -8.12853,-10.80876 -11.13208,-16.668748 -1.09776,-2.1418 -0.81254,-4.53496 -1.85235,-6.61458 -0.9062,-1.81213 -2.63393,-3.11732 -3.38164,-5.02709 -2.6797,-6.84424 -4.57835,-14.84021 -4.2545,-22.225 1.12104,-25.55795 28.82291,-38.502535 48.9376,-47.544115 7.27233,-3.268954 17.46276,-5.108258 23.01875,-10.664217 m 1.05833,0 C 194.6539,-0.437539 197.92653,0 202.19479,0 h 15.61042 71.70208 20.90208 c 2.45797,0 6.08541,-0.64938 7.9375,1.073838 1.89441,1.763792 1.58751,3.581982 1.58751,6.069912 v 10.583334 47.624998 169.862508 42.8625 10.58333 c 0,1.6854 0.28838,3.4343 -0.83344,4.7625 -1.26471,1.49755 -2.57969,3.41313 -4.45823,3.88409 -4.43177,1.11125 -10.73679,0.0847 -15.34584,0.0847 H 244.52812 20.426025 M 190.02394,134.9375 c -3.67321,-2.43469 -4.88182,-7.16438 -7.69514,-10.58333 -5.3848,-6.54394 -11.65013,-12.12877 -19.02777,-16.36448 -2.60615,-1.49622 -5.06148,-3.23903 -7.67292,-4.72784 -1.72694,-0.98452 -3.58537,-1.90976 -4.02749,-4.043098 -0.77893,-3.75735 5.04614,-2.64636 6.12855,-5.04164 0.46355,-1.02578 0.0156,-3.07445 0.0156,-4.21878 0,-3.24088 0,-6.54208 0,-9.78958 0,-8.41243 -0.87789,-17.82022 1.76477,-25.92917 1.47717,-4.53284 3.75126,-8.36268 9.08314,-8.1907 4.83315,0.1561 6.36138,3.70787 7.316,7.92612 1.74598,7.71737 0.88609,16.19541 0.88609,24.07708 0,2.73553 0.26326,5.48349 0.26458,8.20209 5.3e-4,1.03769 -0.30215,2.66991 1.07394,2.86729 2.46592,0.35401 5.34035,-0.85593 7.65731,-1.57507 8.43677,-2.61858 14.98362,-7.9502 19.82285,-15.31514 2.16032,-3.28771 3.04112,-7.77134 5.22049,-10.84395 0.84985,-1.1983 2.18308,-1.97644 3.26708,-2.91438 M 20.426025,142.875 c 1.20679,-1.20358 2.52592,-2.38918 3.96875,-3.43667 1.0846,-0.7874 2.47798,-1.5285 3.21643,-2.65933 1.1915,-1.8243 1.8287,-4.36006 2.81834,-6.33941 1.81552,-3.63114 4.18957,-7.112 6.66809,-10.31876 8.474915,-10.96512 19.159055,-20.202518 31.217975,-27.061838 4.23677,-2.40983 8.68442,-4.55983 13.22916,-6.32566 2.01719,-0.78396 4.39791,-1.80023 6.61327,-1.52797 2.10237,0.2585 2.37648,3.92959 3.03159,5.54672 1.9013,4.69371 4.95882,9.444838 8.61166,12.954268 2.36511,2.27224 5.11201,4.17512 7.93724,5.82798 1.4179,0.82973 3.53721,1.41049 4.56988,2.73605 1.1385,1.46103 1.03531,4.00447 1.62877,5.73379 2.03597,5.93302 3.04086,11.61309 4.41352,17.69269 0.27305,1.2102 1.78144,1.75233 2.61197,2.49502 1.06865,0.95567 1.34567,1.93675 1.51712,3.36021 1.8743,15.56464 -4.23757,30.54535 -7.38479,45.50833 -1.3499,6.41747 -2.15477,13.29902 -2.32542,19.84375 -0.0863,3.29618 0.16669,7.69012 -2.12064,10.05417 l -3.70284,-2.15821 -5.22446,-6.028 -9.85812,-8.35263 -16.40416,-9.04981 -9.24323,-4.04468 -1.955,-2.39951 -7.05803,-1.09643 -10.58333,-4.77097 -5.02708,-2.70722 -2.91042,1.71371 m 87.84167,-90.222918 5.55625,1.5875 c -1.84705,1.84705 -2.64662,2.64662 -4.49791,4.49791 m 50.00625,-4.7625 c -1.71053,1.52109 -3.67295,1.6391 -5.82084,2.22912 -4.53046,1.2446 -8.93365,1.68672 -13.49375,2.53338 m -25.92916,-4.49791 13.22916,7.74567 5.29167,1.51474 m 69.85,52.387508 c 3.41895,3.41921 3.65707,8.42751 5.6724,12.96458 3.02552,6.81117 9.3861,12.31821 15.49427,16.31315 2.13122,1.39383 4.96094,3.49409 7.66789,3.24697 1.13453,-0.10345 1.38298,-1.12977 1.5158,-2.09762 0.35136,-2.55984 0.75591,-5.11466 1.20121,-7.67291 1.54358,-8.86884 2.07618,-19.58314 6.68468,-27.51667 2.80565,-4.83024 9.63058,-5.64727 12.82992,-0.52917 2.85883,4.57332 2.37967,10.52539 1.89547,15.61042 -0.56833,5.96847 -1.48299,11.82026 -2.58788,17.72708 -0.71359,3.81476 -1.85367,8.11821 -2.08254,11.90625 -0.11166,1.85129 2.02036,2.43576 3.29857,3.18638 1.43562,0.84323 2.74822,2.56434 1.8497,4.2209 -1.20572,2.22329 -3.94335,2.83924 -6.07907,3.90445 -4.50294,2.24605 -9.03182,4.59979 -13.22916,7.38558 -7.07892,4.69847 -13.79537,10.2788 -19.01826,17.02144 -1.16496,1.50363 -4.32541,5.0218 -6.34259,3.12526 -1.7317,-1.62824 -1.33271,-6.1587 -1.36313,-8.41692 -0.0868,-6.42435 -0.66464,-13.55461 -2.02618,-19.84375 -3.3147,-15.31065 -10.19519,-30.86339 -8.80507,-46.83125 0.2286,-2.62573 3.20225,-2.89878 3.57611,-5.55652 0.86968,-6.18067 2.22065,-11.73295 3.88408,-17.72682 0.54848,-1.9767 0.53102,-4.86225 1.74599,-6.55823 1.11733,-1.55945 3.94599,-2.40744 5.59488,-3.3139 2.5908,-1.42399 5.0075,-3.46128 7.13979,-5.49725 3.80815,-3.63644 6.69819,-8.30157 8.55424,-13.20562 0.50509,-1.33456 1.19433,-4.894528 2.83845,-5.095078 5.17605,-0.63156 11.69325,3.606268 16.12792,5.823478 15.09158,7.54565 29.80003,19.73448 38.67944,34.1966 2.02408,3.29618 3.76503,6.76116 5.2811,10.31875 0.70643,1.66159 1.02658,3.73301 1.85473,5.29061 0.63235,1.1856 1.8997,1.97035 2.86808,2.91544 1.52928,1.49225 3.06123,3.05674 4.49792,4.49395 M 70.16769,178.59376 C 68.6175,176.43872 68.67412,171.37222 68.16321,168.53959 66.55216,159.60673 63.41684,148.75431 65.1406,139.7 c 1.04431,-5.48534 4.46803,-12.27428 11.37709,-9.4869 3.4245,1.38166 5.09641,6.76143 6.00763,10.01607 1.97908,7.06914 3.04059,14.46477 4.24577,21.69584 0.45561,2.7342 0.36962,7.10856 1.91743,9.26041 -4.14496,4.60375 -12.52167,5.20541 -17.96706,7.4168 -0.94588,0.38418 -1.38747,1.34276 -2.16588,1.93675 -1.84996,1.41129 -3.09589,2.21324 -4.47331,4.1402 M 118.32186,136.525 c -3.61791,3.63035 -3.18267,9.81763 -5.54805,14.55209 -4.44817,8.90349 -14.14357,18.18031 -24.08529,20.10833 m -68.527085,-8.20208 c 2.63537,2.24605 5.50162,2.75643 8.42156,4.94744 2.22904,1.6727 3.33772,4.83156 5.86594,6.16162 2.01192,1.05833 4.244445,0.82471 6.350005,1.85552 m 150.01875,-12.7 c 2.50693,2.06587 2.30849,5.56922 2.68685,8.73125 0.7993,6.67994 1.0496,13.45407 1.92325,20.10834 3.34937,25.50768 1.68487,51.59163 2.80856,77.25833 0.24923,5.68854 0.51884,11.51467 0.51884,17.19792 0,2.10608 0.83159,5.14614 0.0683,7.14375 -0.567,1.48431 -2.21033,2.67229 -3.24327,3.70417 m -25.4,-127.79376 c 0.23998,11.62579 4.16799,23.70905 6.23782,35.18959 3.45784,19.17964 6.1304,38.78527 6.98103,58.20833 0.31591,7.21519 0.2749,14.45683 0.2749,21.69583 0,2.65113 -0.80354,6.5114 -0.18044,8.99584 0.37782,1.50812 2.0873,2.70139 3.09086,3.70417 m 133.35,-124.08959 -5.82083,4.08014 -3.27819,2.06163 -3.53748,4.97073 -1.85209,6.35 -8.07244,10.05417 -33.04249,36.77708 -14.14567,16.66875 -5.07921,8.20208 -0.99959,5.55625 -4.30345,12.96459 -2.74664,8.73125 -0.889,3.96875 -3.54542,3.70417 M 34.448935,174.36042 c 1.88564,8.15076 9.166885,13.27494 14.792855,19.31459 10.85665,11.65463 21.84639,23.05817 31.60157,35.71875 3.60389,4.6773 6.48891,9.52632 9.51336,14.55208 1.17211,1.9476 2.00607,4.68604 4.1529,5.81739 1.04167,0.54901 2.53868,0.6395 3.7039,0.75221 3.506,0.33947 7.34484,0.73581 10.31479,-1.55389 2.60905,-2.01137 4.12379,-5.00407 6.61855,-7.13238 0.99272,0.84402 2.46486,1.49305 3.21363,2.65721 1.67111,2.59848 1.97591,7.5274 2.60641,10.57196 1.91029,9.22602 3.3393,18.54465 5.18663,27.78125 0.5207,2.6035 1.25439,5.29167 1.43536,7.9375 0.063,0.92075 0.41989,2.00554 0.0974,2.91042 -0.52679,1.47637 -2.24737,2.67229 -3.27898,3.70417 m -85.989585,-118.79792 -1.85209,1.85208 m 214.047925,3.70417 c 1.23904,1.56818 3.46498,2.17963 5.29167,2.91041 4.05843,1.62349 8.31716,3.78063 12.7,3.96875 m 6.34999,6.35 c 1.78118,-0.14049 3.81767,-0.31062 5.55626,-0.85222 5.18847,-1.61528 10.37695,-4.62703 15.08124,-7.31626 1.778,-1.01732 3.39989,-2.50481 5.29168,-3.30464 1.98965,-0.84138 4.04812,-0.96388 6.0854,-1.49146 m -196.32083,32.80833 1.66397,7.9375 2.1119,7.67292 0.72205,8.99583 m 115.09375,-11.1125 c -0.0183,6.57093 -3.80576,12.28752 -3.96478,18.78542 -0.0484,1.97564 -0.59267,5.28611 0.15558,7.11597 0.51249,1.2536 2.22514,1.44753 3.07895,2.44422 2.15027,2.50931 3.50018,4.54475 7.08025,4.46008 2.93504,-0.0714 5.40704,-0.47889 8.2021,-1.05569 m -150.81252,-12.43541 1.30704,6.35 11.07467,25.92916 2.76304,7.40834 0.95726,4.23333 3.21258,3.43959 m 112.97708,-40.48126 c -3.02207,2.57969 -2.9755,5.40015 -3.59542,9.26042 -0.95012,5.91344 -1.73778,11.85069 -2.91333,17.72708 -0.5379,2.68817 -1.78805,6.86594 -1.15676,9.525 0.37069,1.56105 2.39607,2.93159 3.43218,3.96876 m -201.877095,0 h 0.26459";

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


// let a = getPanels();
// a.then(value => {
//     let tempStrings = ["20,0,0,1;20,1,0,1;20,0,0,1;20,1,0,0;20,0,0,0", 
//     "17,6,0,0;17,4,2,0;17,6,0,1;17,4,1,0;17,0,0,0;17,4,3,0;17,4,1,0;17,0,0,0;17,4,3,0;17,7,0,0;17,4,0,0;17,7,0,1",
//     "16,8,0,0;16,5,0,0;16,4,0,0;16,6,0,0;16,7,0,0;16,6,0,1;16,5,0,0;16,8,0,0"];
//     let panelData:{id:number, name:string, d:string}[][] = [];
//     for(let i:number = 0; i < 22; ++i) {panelData.push([]);}
//     for(let i:number = 0; i < value.length; ++i) {
//         let tmp:{id:number, name:string, d:string} = {id:value[i][1], name:value[i][3], d:value[i][4]};
//         panelData[value[i][1]].push(tmp);
//     }
    
//     for(let i:number = 0; i < tempStrings.length; ++i) {
//         let tmpString:string[] = tempStrings[i].split(";");
//         let panels:string[] = [];

//         console.log(tmpString);
//     }
//   }).catch(err => {
//     console.log(err);
//   });

if(process.argv[3]) {let a = new LightScreen(Number(process.argv[3]));}

// This is where the website result is placed
//let websiteText:string[] = ['194.66666666666666','320','M -44.166681 0.53946792 v 300.00003208 h 300.000031 v -300.00003208 Z M -39.166607 5.5395419 h 289.99987699999997 v 46.000017099999994 h -289.99987699999997 Z M -39.166607 57.539539000000005 h 89.99967699999999 v 237.999891 h -89.999677 Z M 56.833600000000004 57.539539000000005 h 97.99945999999998 v 89.999681 h -97.99946 Z M 160.83359000000002 57.539539000000005 h 89.99968000000001 v 237.999891 h -89.99968000000004 Z M 56.8336 153.5392 h 97.99946 v 142.00023 h -97.99946 Z','M -44.166681 0.53946792 v 300.00003208 h 300.000031 v -300.00003208 Z M -39.166607 5.5395419 h 289.99987699999997 v 46.000017099999994 h -289.99987699999997 Z M -39.166607 57.539539000000005 h 89.99967699999999 v 237.999891 h -89.999677 Z M 56.833600000000004 57.539539000000005 h 97.99945999999998 v 89.999681 h -97.99946 Z M 160.83359000000002 57.539539000000005 h 89.99968000000001 v 237.999891 h -89.99968000000004 Z M 56.8336 153.5392 h 97.99946 v 142.00023 h -97.99946 Z','M -44.166681 0.53946792 v 300.00003208 h 300.000031 v -300.00003208 Z M -39.166607 5.5395419 h 289.99987699999997 v 46.000017099999994 h -289.99987699999997 Z M -39.166607 57.539539000000005 h 89.99967699999999 v 237.999891 h -89.999677 Z M 56.833600000000004 57.539539000000005 h 97.99945999999998 v 89.999681 h -97.99946 Z M 160.83359000000002 57.539539000000005 h 89.99968000000001 v 237.999891 h -89.99968000000004 Z M 56.8336 153.5392 h 97.99946 v 142.00023 h -97.99946 Z','M -44.166681 2.9122837 v 300.0000263 h 300.000031 v -300.0000263 Z M -39.166607 7.912357699999999 h 141.99967700000002 v 68.0001243 h -141.99967700000002 Z M 108.83359999999999 7.912357699999999 h 141.99967 v 68.0001243 h -141.99966999999998 Z M -39.166607 81.912461 h 41.9998502 v 67.999569 h -41.9998502 Z M 8.833220099999998 81.912461 h 41.9998499 v 67.999569 h -41.9998499 Z M 56.8336 81.912461 h 45.999469999999995 v 67.999569 h -45.999469999999995 Z M 108.83305 81.912461 h 46.00000999999999 v 67.999569 h -46.00001 Z M 160.83359000000002 81.912461 h 41.99985000000001 v 67.999569 h -41.99985000000001 Z M 208.83342000000002 81.912461 h 41.99985000000001 v 67.999569 h -41.99985000000004 Z M -39.166607 155.91256 h 89.99967699999999 v 141.99967999999998 h -89.999677 Z M 56.833600000000004 155.91256 h 45.99947 v 75.99991 h -45.99947000000001 Z M 108.83305000000001 155.91256 h 46.00001 v 75.99991 h -46.00001 Z M 160.83359000000002 155.91256 h 89.99968000000001 v 141.99967999999998 h -89.99968000000004 Z M 56.8336 237.91245 h 45.999469999999995 v 59.99978999999999 h -45.999469999999995 Z M 108.83305 237.91245 h 46.00000999999999 v 59.99978999999999 h -46.00001 Z','M -44.166681 2.9122837 v 300.0000263 h 300.000031 v -300.0000263 Z M -39.166607 7.912357699999999 h 141.99967700000002 v 68.0001243 h -141.99967700000002 Z M 108.83359999999999 7.912357699999999 h 141.99967 v 68.0001243 h -141.99966999999998 Z M -39.166607 81.912461 h 41.9998502 v 67.999569 h -41.9998502 Z M 8.833220099999998 81.912461 h 41.9998499 v 67.999569 h -41.9998499 Z M 56.8336 81.912461 h 45.999469999999995 v 67.999569 h -45.999469999999995 Z M 108.83305 81.912461 h 46.00000999999999 v 67.999569 h -46.00001 Z M 160.83359000000002 81.912461 h 41.99985000000001 v 67.999569 h -41.99985000000001 Z M 208.83342000000002 81.912461 h 41.99985000000001 v 67.999569 h -41.99985000000004 Z M -39.166607 155.91256 h 89.99967699999999 v 141.99967999999998 h -89.999677 Z M 56.833600000000004 155.91256 h 45.99947 v 75.99991 h -45.99947000000001 Z M 108.83305000000001 155.91256 h 46.00001 v 75.99991 h -46.00001 Z M 160.83359000000002 155.91256 h 89.99968000000001 v 141.99967999999998 h -89.99968000000004 Z M 56.8336 237.91245 h 45.999469999999995 v 59.99978999999999 h -45.999469999999995 Z M 108.83305 237.91245 h 46.00000999999999 v 59.99978999999999 h -46.00001 Z','M -44.166681 2.9122837 v 300.0000263 h 300.000031 v -300.0000263 Z M -39.166607 7.912357699999999 h 141.99967700000002 v 68.0001243 h -141.99967700000002 Z M 108.83359999999999 7.912357699999999 h 141.99967 v 68.0001243 h -141.99966999999998 Z M -39.166607 81.912461 h 41.9998502 v 67.999569 h -41.9998502 Z M 8.833220099999998 81.912461 h 41.9998499 v 67.999569 h -41.9998499 Z M 56.8336 81.912461 h 45.999469999999995 v 67.999569 h -45.999469999999995 Z M 108.83305 81.912461 h 46.00000999999999 v 67.999569 h -46.00001 Z M 160.83359000000002 81.912461 h 41.99985000000001 v 67.999569 h -41.99985000000001 Z M 208.83342000000002 81.912461 h 41.99985000000001 v 67.999569 h -41.99985000000004 Z M -39.166607 155.91256 h 89.99967699999999 v 141.99967999999998 h -89.999677 Z M 56.833600000000004 155.91256 h 45.99947 v 75.99991 h -45.99947000000001 Z M 108.83305000000001 155.91256 h 46.00001 v 75.99991 h -46.00001 Z M 160.83359000000002 155.91256 h 89.99968000000001 v 141.99967999999998 h -89.99968000000004 Z M 56.8336 237.91245 h 45.999469999999995 v 59.99978999999999 h -45.999469999999995 Z M 108.83305 237.91245 h 46.00000999999999 v 59.99978999999999 h -46.00001 Z','M -44.166681 -0.25147069 v 300.00003069 h 300.000031 v -300.00003069 Z M -39.166607 4.7486033 h 89.99967699999999 v 289.9998867 h -89.999677 Z M 56.833600000000004 4.7486033 h 45.99947 v 289.9998867 h -45.99947000000001 Z M 108.83305000000001 4.7486033 h 46.00001 v 289.9998867 h -46.00001 Z M 160.83359000000002 4.7486033 h 89.99968000000001 v 289.9998867 h -89.99968000000001 Z','M -44.166681 -0.25147069 v 300.00003069 h 300.000031 v -300.00003069 Z M -39.166607 4.7486033 h 89.99967699999999 v 289.9998867 h -89.999677 Z M 56.833600000000004 4.7486033 h 45.99947 v 289.9998867 h -45.99947000000001 Z M 108.83305000000001 4.7486033 h 46.00001 v 289.9998867 h -46.00001 Z M 160.83359000000002 4.7486033 h 89.99968000000001 v 289.9998867 h -89.99968000000001 Z','M -44.166681 -0.25147069 v 300.00003069 h 300.000031 v -300.00003069 Z M -39.166607 4.7486033 h 89.99967699999999 v 289.9998867 h -89.999677 Z M 56.833600000000004 4.7486033 h 45.99947 v 289.9998867 h -45.99947000000001 Z M 108.83305000000001 4.7486033 h 46.00001 v 289.9998867 h -46.00001 Z M 160.83359000000002 4.7486033 h 89.99968000000001 v 289.9998867 h -89.99968000000001 Z','M -44.166681 -0.25147069 v 300.00003069 h 300.000031 v -300.00003069 Z M -39.166607 4.7486033 h 89.99967699999999 v 289.9998867 h -89.999677 Z M 56.833600000000004 4.7486033 h 45.99947 v 289.9998867 h -45.99947000000001 Z M 108.83305000000001 4.7486033 h 46.00001 v 289.9998867 h -46.00001 Z M 160.83359000000002 4.7486033 h 89.99968000000001 v 289.9998867 h -89.99968000000001 Z','M -44.166681 -0.25147069 v 300.00003069 h 300.000031 v -300.00003069 Z M -39.166607 4.7486033 h 89.99967699999999 v 289.9998867 h -89.999677 Z M 56.833600000000004 4.7486033 h 45.99947 v 289.9998867 h -45.99947000000001 Z M 108.83305000000001 4.7486033 h 46.00001 v 289.9998867 h -46.00001 Z M 160.83359000000002 4.7486033 h 89.99968000000001 v 289.9998867 h -89.99968000000001 Z','M -44.166681 -0.25147069 v 300.00003069 h 300.000031 v -300.00003069 Z M -39.166607 4.7486033 h 89.99967699999999 v 289.9998867 h -89.999677 Z M 56.833600000000004 4.7486033 h 45.99947 v 289.9998867 h -45.99947000000001 Z M 108.83305000000001 4.7486033 h 46.00001 v 289.9998867 h -46.00001 Z M 160.83359000000002 4.7486033 h 89.99968000000001 v 289.9998867 h -89.99968000000001 Z','M -44.166681 2.1213451 v 300.0000249 h 300.000031 v -300.0000249 Z M 56.97416 7.2625302 h 45.71835 v 128.7175898 h -45.71835 Z M 108.97416 7.2625302 h 45.71834 v 128.7175898 h -45.71834 Z M -38.969272 7.3187542 h 89.605006 v 128.6051358 h -89.605006 Z M 161.03093 7.3187542 h 89.60501 v 128.6051358 h -89.60501 Z M -38.965965 142.3224 h 141.59839499999998 v 66.59837999999999 h -141.59839499999998 Z M 109.03424 142.3224 h 141.59839999999997 v 66.59837999999999 h -141.59839999999997 Z M -38.962657 215.32536 h 289.591967 v 81.59197 h -289.591967 Z','M -44.166681 2.1213451 v 300.0000249 h 300.000031 v -300.0000249 Z M 56.97416 7.2625302 h 45.71835 v 128.7175898 h -45.71835 Z M 108.97416 7.2625302 h 45.71834 v 128.7175898 h -45.71834 Z M -38.969272 7.3187542 h 89.605006 v 128.6051358 h -89.605006 Z M 161.03093 7.3187542 h 89.60501 v 128.6051358 h -89.60501 Z M -38.965965 142.3224 h 141.59839499999998 v 66.59837999999999 h -141.59839499999998 Z M 109.03424 142.3224 h 141.59839999999997 v 66.59837999999999 h -141.59839999999997 Z M -38.962657 215.32536 h 289.591967 v 81.59197 h -289.591967 Z','M -44.166681 2.1213451 v 300.0000249 h 300.000031 v -300.0000249 Z M 56.97416 7.2625302 h 45.71835 v 128.7175898 h -45.71835 Z M 108.97416 7.2625302 h 45.71834 v 128.7175898 h -45.71834 Z M -38.969272 7.3187542 h 89.605006 v 128.6051358 h -89.605006 Z M 161.03093 7.3187542 h 89.60501 v 128.6051358 h -89.60501 Z M -38.965965 142.3224 h 141.59839499999998 v 66.59837999999999 h -141.59839499999998 Z M 109.03424 142.3224 h 141.59839999999997 v 66.59837999999999 h -141.59839999999997 Z M -38.962657 215.32536 h 289.591967 v 81.59197 h -289.591967 Z'];
// #ffffff;,#ffffff;,#ffffff;,#ffffff;,#ffffff;,#ffffff;,#ffffff;,#ffffff;,#ffffff;,#ffffff;,fill:#A2ACB7,fill:#A2ACB7,#ffffff;,fill:#F4C242,fill:#F4C242,fill:#F4C242,fill:#F4C242,#ffffff;,#ffffff;,fill:#A2ACB7,fill:#A2ACB7,#ffffff;,fill:#A2ACB7,fill:#A2ACB7,fill:#A2ACB7,fill:#A2ACB7,#ffffff;,fill:#F4C242,fill:#F4C242,fill:#F4C242,fill:#F4C242,#ffffff;,#ffffff;,fill:#A2ACB7,fill:#A2ACB7,#ffffff;,fill:#A2ACB7,fill:#A2ACB7,#ffffff;,fill:#A2ACB7,fill:#A2ACB7,#ffffff;,#ffffff;,fill:#A2ACB7,fill:#A2ACB7,#ffffff;,fill:#A2ACB7,fill:#A2ACB7,#ffffff;,#ffffff;,fill:#F4C242,fill:#F4C242,#ffffff;,fill:#A2ACB7,fill:#A2ACB7,#ffffff;,#ffffff;,fill:#F4C242,fill:#F4C242,#ffffff;
// fill:#2D60AA,fill:#ABB863,fill:#F4C242,fill:#ABB863,fill:#2D60AA,fill:#2D60AA,fill:#ABB863,fill:#F4C242,fill:#ABB863,fill:#2D60AA,fill:#B1C4C2,fill:#B1C4C2,fill:#2D60AA,fill:#F4C242,fill:#F4C242,fill:#F4C242,fill:#F4C242,fill:#2D60AA,fill:#ABB863,fill:#B1C4C2,fill:#B1C4C2,fill:#ABB863,fill:#B1C4C2,fill:#B1C4C2,fill:#B1C4C2,fill:#B1C4C2,fill:#2D60AA,fill:#F4C242,fill:#F4C242,fill:#F4C242,fill:#F4C242,fill:#2D60AA,fill:#ABB863,fill:#B1C4C2,fill:#B1C4C2,fill:#ABB863,fill:#B1C4C2,fill:#B1C4C2,fill:#ABB863,fill:#B1C4C2,fill:#B1C4C2,fill:#ABB863,fill:#ABB863,fill:#B1C4C2,fill:#B1C4C2,fill:#ABB863,fill:#B1C4C2,fill:#B1C4C2,fill:#ABB863,fill:#ABB863,fill:#F4C242,fill:#F4C242,fill:#2D60AA,fill:#B1C4C2,fill:#B1C4C2,fill:#ABB863,fill:#ABB863,fill:#F4C242,fill:#F4C242,fill:#2D60AA;

//fill:#317d92,fill:#e55623,fill:#317d92,fill:#e55623,fill:#317d92,fill:#317d92,fill:#e55623,fill:#317d92,fill:#e55623,fill:#317d92,fill:#317d92,fill:#e55623,fill:#317d92,fill:#e55623,fill:#317d92,fill:#317d92,fill:#317d92,fill:#e55623,fill:#e55623,fill:#317d92,fill:#317d92,fill:#e55623,fill:#e55623,fill:#e55623,fill:#317d92,fill:#317d92,fill:#e55623,fill:#317d92,fill:#317d92,fill:#317d92,fill:#317d92,fill:#e55623,fill:#e55623,fill:#317d92,fill:#317d92,fill:#e55623,fill:#e55623,fill:#e55623,fill:#317d92,fill:#317d92,fill:#e55623,fill:#317d92,fill:#317d92,fill:#317d92,fill:#317d92,fill:#e55623,fill:#e55623,fill:#317d92,fill:#317d92,fill:#e55623,fill:#e55623,fill:#e55623,fill:#317d92,fill:#317d92,fill:#e55623,fill:#317d92,fill:#317d92,fill:#e55623,fill:#317d92,fill:#317d92,fill:#e55623,fill:#e55623,fill:#317d92,fill:#317d92,fill:#e55623,fill:#e55623,fill:#317d92,fill:#317d92,fill:#e55623,fill:#e55623,fill:#317d92,fill:#317d92,fill:#e55623,fill:#e55623,fill:#317d92,fill:#317d92,fill:#e55623,fill:#e55623,fill:#317d92,fill:#317d92,fill:#e55623,fill:#317d92,fill:#317d92,fill:#e55623,fill:#e55623,fill:#317d92,fill:#317d92,fill:#e55623,fill:#317d92,fill:#317d92,fill:#e55623,fill:#e55623,fill:#317d92,fill:#317d92,fill:#e55623,fill:#317d92,fill:#317d92,fill:#e55623,fill:#e55623,fill:#317d92,fill:#317d92,fill:#e55623
// for(let panel:number = 0; panel < websiteText.length-2; ++panel) {
//     let p:string = websiteText[panel+2];
//     let test:SVGTemplate = new SVGTemplate(p);
//     //test.getFileText(Number(websiteText[0])/300, Number(websiteText[1])/300, "panelFile"+panel)
//     test.getPanesFileText(Number(websiteText[0])/300, Number(websiteText[1])/300, "paneFile"+panel);
// }
// let p:string = "M -44.166681,0.53946792 V 300.5395 H 255.83335 V 0.53946792 Z m 5.000074,5.00007398 H 250.83327 V 51.539559 H -39.166607 Z m 0,51.9999971 H 50.83307 V 295.53943 h -89.999677 z m 96.000207,0 h 97.99946 V 147.53922 H 56.8336 Z m 103.99999,0 h 89.99968 V 295.53943 H 160.83359 Z M 56.8336,153.5392 h 97.99946 V 295.53943 H 56.8336 Z";

/*******   New Scaling Tests  ************/
// let test:SVGTemplate = new SVGTemplate(p);
// console.log("100x386\n")
//  console.log(test.getLineScaledD((300-6)/320, (300-6)/320));
// console.log("\n\n");
// console.log(test.getLineScaledPanes((386-6)/200, (100-6)/110));



// console.log("\n\n386x100\n")
// console.log(test.getLineScaledD((386-6)/200, (100-6)/110));
// console.log("\n\n");
// console.log(test.getLineScaledPanes((386-6)/200, (100-6)/110));

// test.getFileText(Number(websiteText[0])/300, Number(websiteText[1])/300);
//console.log(test.getScaledD(343/300, 305/300));
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