// Class for individual polygon object within an SVG design template
class Polygon {
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
    updateMinMax():void {
        if(this.currentPoint[0] < this.xMin) {this.xMin = this.currentPoint[0];}
        if(this.currentPoint[0] > this.xMax) {this.xMax = this.currentPoint[0];}
        if(this.currentPoint[1] < this.yMin) {this.yMin = this.currentPoint[1];}
        if(this.currentPoint[1] > this.yMax) {this.yMax = this.currentPoint[1];}
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
            for(let j:number = i+1; "MmLlHhVvZz".indexOf(pathArray[j]) == -1; ++j) {nextChars = nextChars.concat(pathArray[j].split(","));}
            
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
                    nextPoint = [Number(nextChars[4]), Number(nextChars[5])];
                    this.scalablePath.push("c");
                    for(let i:number = 0; i < nextChars.length; ++i) {
                        diffPoints.push(Number(nextChars[i]) - this.currentPoint[i%2]);
                        this.scalablePath.push(diffPoints[i].toString());
                    }
                    break;
                case "c":
                    nextPoint = [this.currentPoint[0] + Number(nextChars[4]), this.currentPoint[1] + Number(nextChars[5])];
                    this.scalablePath.push("c");
                    for(let i:number = 0; i < nextChars.length; ++i) {
                        diffPoints.push(Number(nextChars[i]));
                        this.scalablePath.push(diffPoints[i].toString());
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
                        if(j > 0) {
                            this.currentPoint = nextPoint;
                            this.updateMinMax();
                        }

                        nextPoint = [Number(nextChars[5+(j*7)]), Number(nextChars[6+(j*7)])];
                        this.scalablePath.push("a");
                        diffPoints = [nextPoint[0]-this.currentPoint[0], nextPoint[1]-this.currentPoint[1]];
                        for(let k:number = 0; k < 5; ++k) {
                            this.scalablePath.push(nextChars[k+(j*7)]);
                        }
                        this.scalablePath.push(diffPoints[0].toString(), diffPoints[1].toString());
                    }
                    break;
                case "a":
                    // Looping for implicit commands
                    for(let j:number = 0; j < Math.floor(nextChars.length/7); ++j) {
                        if(j > 0) {
                            this.currentPoint = nextPoint;
                            this.updateMinMax();
                        }

                        nextPoint = [this.currentPoint[0] + Number(nextChars[5+(j*7)]), this.currentPoint[1] + Number(nextChars[6+(j*7)])];
                        this.scalablePath.push("a");
                        diffPoints = [nextPoint[0], nextPoint[1]];
                        for(let k:number = 0; k < 5; ++k) {
                            this.scalablePath.push(nextChars[k+(j*7)]);
                        }
                        this.scalablePath.push(diffPoints[0].toString(), diffPoints[1].toString());
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
        let centerPoint:number[] = [(this.xMax-this.xMin)/2 + this.xMin, (this.yMax-this.yMin)/2 + this.yMin];
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
            for(let j:number = i+1; "MmLlHhVvZz".indexOf(scaledPath[j]) == -1; ++j) {nextChars = nextChars.concat(scaledPath[j].split(","));}
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
class SVGTemplate {
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
            if(i === 0 || this.subShapes[i].yMax > this.xMax) {this.yMax = this.subShapes[i].yMax;}
        }

        // Getting starting point for template
        this.startingPoint = this.subShapes[0].startingPoint;
        this.width = this.xMax - this.xMin;
        this.height = this.yMax - this.yMin;

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

    // Method to get a scaled version of the template --> returns [scaledD, newScaleX, newScaleY]
    getScaledD(scaleX:number, scaleY:number):string[] {
        let scaledD:string = "";
        // Getting outset values for reducing wallwidth in x/y
        let xOutset:number = (4*this.width*(scaleX-1)) / (scaleX*this.width - 8);
        let yOutset:number = (4*this.height*(scaleY-1)) / (scaleY*this.height - 8);

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
let p:string = "M -3.1667319,34.166907 V 262.16643 H 214.8334 V 34.166907 Z m 8.0005459,8.00003 H 44.833439 V 82.167078 H 4.833814 Z m 47.999654,0 H 158.8332 V 82.167078 H 52.833468 Z m 114.000272,0 h 39.99963 V 82.167078 H 166.83374 Z M 52.833468,90.166588 H 158.8332 v 5.64e-4 39.999628 l -0.001,5.6e-4 h 0.001 l -52.99987,33.99938 -52.999862,-33.99947 h 0.0011 l -0.0011,-5.7e-4 V 90.167107 Z m -47.999654,5.64e-4 h 39.999625 v 115.999638 5.6e-4 H 4.833814 v -5.6e-4 z m 161.999926,0 h 39.99963 V 206.16674 H 166.83374 Z M 52.833468,139.22509 101.83306,172.16624 v 5.6e-4 h 5.1e-4 v 81.99965 h -5.1e-4 -48.999592 v -81.99965 -5.6e-4 -32.94063 z m 105.999732,0 v 5.7e-4 32.94063 5.6e-4 h 5.6e-4 v 81.99964 h -5.6e-4 -48.9996 v -81.99964 -5.6e-4 h 5.2e-4 z M 4.833814,214.16677 h 39.999625 v 40.00014 H 4.833814 Z m 161.999926,0 h 39.99963 v 40.00014 h -39.99963 z";


let test:SVGTemplate = new SVGTemplate(p);
let result:string[] = test.getScaledD(2, 3);
console.log(result[0]);
console.log("\n" + result[1] + "," + result[2]);

/*
Orig:
M -7.224838433118521 30.766334896900844 v 231.9995045361402 h 222.00013327651328 v -231.9995045361402 Z M 51.85793957183328 41.60792369058448 h 107.94467163743226 v 40.70189889122812 v 0.0005240350878921163 l -53.97233429119319 34.59648513473684 l -53.972337346239065 -34.59648513473684 v -0.0005240350878921163 Z M 4.188569189629732 40.029516185321796 h 40.73356261376291 v 166.8769946189473 h -40.73356261376291 Z M 169.16097088742822 40.029516185321796 h 40.73356801101059 v 166.8769946189473 h -40.73356801101059 Z M 52.90381329715388 88.93224941273145 l 49.89866791211167 33.519052713312675 v 0.0005291228071939713 v 133.29747232666642 h -49.89866791211167 v -133.2974723266664 v -0.0005291228071939713 Z M 160.84848498963203 88.93224941273145 v 33.519052713312675 v 0.0005291228071939713 v 133.29747232666642 h -49.898664857065796 v -133.2974723266664 v -0.0005291228071939713 h 0.0005295412823898005 Z M 4.188569189629732 217.2223249733918 h 40.73356261376291 v 40.701896856140394 h -40.73356261376291 Z M 169.16097088742822 217.2223249733918 h 40.73356801101059 v 40.701896856140394 h -40.73356801101059 Z

New:
M -7.224838433118521 30.766334896900844 v 231.9995045361402 h 222.00013327651328 v -231.9995045361402 Z M 51.85793957183328 41.60792369058448 h 107.94467163743226 v 40.70189889122812 v 0.0005240350878921163 l -53.97233429119319 34.59648513473684 l -53.972337346239065 -34.59648513473684 v -0.0005240350878921163 Z M 4.188569189629732 40.029516185321796 h 40.73356261376291 v 166.8769946189473 h -40.73356261376291 Z M 169.16097088742822 40.029516185321796 h 40.73356801101059 v 166.8769946189473 h -40.73356801101059 Z M 52.90381329715388 88.93224941273145 l 49.89866791211167 33.519052713312675 v 0.0005291228071939713 v 133.29747232666642 h -49.89866791211167 v -133.2974723266664 v -0.0005291228071939713 Z M 160.84848498963203 88.93224941273145 v 33.519052713312675 v 0.0005291228071939713 v 133.29747232666642 h -49.898664857065796 v -133.2974723266664 v -0.0005291228071939713 h 0.0005295412823898005 Z M 4.188569189629732 217.2223249733918 h 40.73356261376291 v 40.701896856140394 h -40.73356261376291 Z M 169.16097088742822 217.2223249733918 h 40.73356801101059 v 40.701896856140394 h -40.73356801101059 Z
*/