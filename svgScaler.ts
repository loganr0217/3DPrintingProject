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
    scalablePath:string[];

    prevPolygonPoint:number[];

    // Values for max/min in x/y
    xMin:number;
    xMax:number;
    yMin:number;
    yMax:number;

    polygonWidth:number;
    polygonHeight:number;

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

    // Method to parse the given array of commands
    parsePath(pathArray:string[]):void {
        let currentChar:string;
        let nextChars:string[] = [];
        let nextPoint:number[] = [];
        let diffPoints:number[] = [];

        // Getting the next numbers to go with the first command
        for(let j:number = 1; "MmLlHhVvZz".indexOf(pathArray[j]) == -1; ++j) {
            nextChars = nextChars.concat(pathArray[j].split(","));
        }

        // Starting path off with absolute M
        this.scalablePath.push("M");
        // Getting starting and current point depending on M/m command
        if(pathArray[0] == "M") {
            // Looping for implicit commands (implicit for M are L)
            for(let j:number = 0; j < Math.floor(nextChars.length/2); ++j) {
                nextPoint = [Number(nextChars[0+(j*2)]), Number(nextChars[1+(j*2)])];
                // Implicit commands
                if(j > 0) {
                    this.scalablePath.push("l");
                    diffPoints = [nextPoint[0]-this.currentPoint[0], nextPoint[1]-this.currentPoint[1]];
                    this.scalablePath.push(diffPoints[0].toString(), diffPoints[1].toString());
                }
                // First command
                else {
                    this.startingPoint.push(Number(nextChars[0]), Number(nextChars[1]));
                    this.currentPoint = this.startingPoint;
                    this.scalablePath.push(nextPoint[0].toString(), nextPoint[1].toString());
                }

                // Updating current point
                this.currentPoint = nextPoint;
                this.updateMinMax();
            }
        }
        else if(pathArray[0] == "m") {
            // Looping for implicit commands (implicit for M are L)
            for(let j:number = 0; j < Math.floor(nextChars.length/2); ++j) {
                // Implicit commands
                if(j > 0) {   
                    this.scalablePath.push("l");
                    nextPoint = [this.currentPoint[0] + Number(nextChars[0+(j*2)]), this.currentPoint[1] + Number(nextChars[1+(j*2)])];
                    // Difference from next point
                    diffPoints = [nextPoint[0]-this.currentPoint[0], nextPoint[1]-this.currentPoint[1]];
                    this.scalablePath.push(diffPoints[0].toString(), diffPoints[1].toString());
                }
                // First command
                else {
                    // Starting polygon with relative m
                    if(this.prevPolygonPoint.length == 0) {this.startingPoint.push(Number(nextChars[0]), Number(nextChars[1]));}
                    // Relative m with a previous polygon
                    else {this.startingPoint.push(this.prevPolygonPoint[0] + Number(nextChars[0]), this.prevPolygonPoint[1] + Number(nextChars[1]));}
                    this.currentPoint = this.startingPoint;
                    nextPoint = this.startingPoint;
                    this.scalablePath.push(nextPoint[0].toString(), nextPoint[1].toString());
                }

                // Updating current point
                this.currentPoint = nextPoint;
                this.updateMinMax();
            }
            
            
        }

        // Starting the mins and maxes as the starting point
        this.xMin = this.startingPoint[0];
        this.xMax = this.startingPoint[0];
        this.yMin = this.startingPoint[1];
        this.yMax = this.startingPoint[1];

        // Ignoring the first M/m command and value as well as final Z command
        for(let i:number = 2; i < pathArray.length - 1; ++i) {
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
                        if(j > 0) {this.scalablePath.push("l");}
                        else {this.scalablePath.push("m");}

                        nextPoint = [Number(nextChars[0+(j*2)]), Number(nextChars[1+(j*2)])];
                        diffPoints = [nextPoint[0]-this.currentPoint[0], nextPoint[1]-this.currentPoint[1]];
                        this.scalablePath.push(diffPoints[0].toString(), diffPoints[1].toString());

                        // Updating current point and mins/maxes
                        this.currentPoint = nextPoint;
                        this.updateMinMax();
                    }
                    break;
                case "m":
                    // Looping for implicit commands (implicit for m are l)
                    for(let j:number = 0; j < Math.floor(nextChars.length/2); ++j) {
                        if(j > 0) {this.scalablePath.push("l");}
                        else {this.scalablePath.push("m");}

                        nextPoint = [this.currentPoint[0] + Number(nextChars[0+(j*2)]), this.currentPoint[1] + Number(nextChars[1+(j*2)])];
                        diffPoints = [nextPoint[0]-this.currentPoint[0], nextPoint[1]-this.currentPoint[1]];
                        this.scalablePath.push(diffPoints[0].toString(), diffPoints[1].toString());

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
    outset():string[] {
        return this.scalablePath;
    }
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
        updateMinMax():void {} --> updates the min/max attributes using currentPoint attribute
        parsePath(pathArray:string[]):void {} --> creates scalablePath using array of normal path commands
        outset():string {} --> returns the optimized path (will offset path eventually)
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

        // Identifying outer edge of template (rest is the panes)
        for(let i:number = 0; i < this.subShapes.length; ++i) {
            if(this.subShapes[i].polygonWidth == this.width && this.subShapes[i].polygonHeight == this.height) {this.outerEdgeIndex = i;}
        }
    }
}

// Early test stuff
//let p:string = "M 254.94507,123.84466 V 896.28411 H 1027.3865 V 123.84466 Z m 28.51953,28.51758 H 626.82007 V 320.32318 A 196.20422,196.20425 0 0 0 451.22241,495.71966 H 283.4646 Z m 372.04688,0 H 998.8689 V 495.71966 H 830.90601 A 196.20441,196.2044 0 0 0 655.51148,320.12005 Z M 641.16577,347.24505 A 162.81888,162.81886 0 0 1 803.98413,510.06536 162.81888,162.81886 0 0 1 641.16577,672.88372 162.81888,162.81886 0 0 1 478.34741,510.06536 162.81888,162.81886 0 0 1 641.16577,347.24505 Z M 283.4646,524.40911 H 451.42554 A 196.20445,196.20439 0 0 0 626.82202,700.00872 V 867.76653 H 283.4646 Z m 547.44141,0 H 998.8689 V 867.76653 H 655.51148 V 700.00872 A 196.20441,196.20293 0 0 0 830.90601,524.40911 Z";
//let p:string = "M 26.904297 119.57422 L 26.904297 696.52344 L 756.3125 696.52344 L 756.3125 119.57422 L 26.904297 119.57422 z M 83.703125 167.4043 L 415.52344 167.4043 L 415.52344 415.52344 L 83.703125 415.52344 L 83.703125 167.4043 z M 484.2793 409.54492 L 657.66211 409.54492 L 657.66211 585.91797 L 484.2793 585.91797 L 484.2793 409.54492 z M 128.54297 484.2793 L 373.67188 484.2793 L 373.67188 597.875 L 128.54297 597.875 L 128.54297 484.2793 z";

// 1.7A 01
//let p:string = "M -3.1667375,34.1668 V 262.16653 H 214.8334 V 34.1668 Z m 8.0003398,8.000337 H 44.833642 V 206.16692 H 4.8336023 Z m 47.9998267,0 H 101.83316 V 173.16676 l -48.999731,33.00016 v -33.00016 z m 57.000071,0 h 49.00028 V 173.16676 h -5.6e-4 v 33.00016 L 109.8335,173.16676 Z m 57.00007,0 h 40.00004 V 206.16692 h -40.00004 z m -61.00024,137.999503 52.9999,34.00006 v 40.00004 H 52.833429 V 214.1667 Z M 4.8170641,214.1667 H 44.816553 v 40.00004 H 4.8170641 Z m 162.0159559,0 h 40.00004 v 40.00004 h -40.00004 z";

// 1.7A 02
//let p:string = "M -1.6548343,28.119286 V 256.1188 H 216.3453 V 28.119286 Z M 54.345366,36.118797 H 103.34496 V 248.11929 H 54.345366 Z m 56.999614,0 H 160.3451 V 84.177878 117.11902 248.11929 H 111.34498 V 117.11902 Z M 6.3451957,36.119326 H 46.345346 V 248.11929 H 6.3451957 Z m 161.9999243,0 h 40.00015 V 248.11929 h -40.00015 z";

// 1.7A 03
//let p:string = "M -11.96875 129.13477 L -11.96875 990.86523 L 811.96875 990.86523 L 811.96875 129.13477 L -11.96875 129.13477 z M 199.68555 159.36914 L 600.31445 159.36914 L 600.31445 310.55078 L 600.31445 310.55273 L 400 439.05664 L 199.68555 310.55273 L 199.68555 310.55078 L 199.68555 159.36914 z M 630.55273 159.36914 L 781.73242 159.36914 L 781.73242 960.63086 L 630.55273 960.63086 L 630.55273 159.36914 z M 18.261719 159.45508 L 169.44336 159.45508 L 169.44336 960.71289 L 18.261719 960.71289 L 18.261719 159.45508 z M 199.68555 341.01172 L 384.88086 465.51172 L 384.88086 465.51367 L 384.88086 960.62891 L 199.68555 960.62891 L 199.68555 465.51367 L 199.68555 465.51172 L 199.68555 341.01172 z M 600.31445 341.01172 L 600.31445 465.51172 L 600.31445 465.51367 L 600.31445 960.62891 L 415.11914 960.62891 L 415.11914 465.51367 L 415.11914 465.51172 L 600.31445 341.01172 z";

// 1.7A 04
let p:string = "M -3.1667317,34.166907 V 262.16642 H 214.8334 V 34.166907 Z M 52.833467,42.166419 H 158.83319 v 40.000142 5.15e-4 L 105.83333,116.16707 52.833467,82.167076 v -5.15e-4 z M 4.8338133,42.166935 H 44.833438 V 206.16674 H 4.8338133 Z m 161.9999267,0 h 39.99963 V 206.16674 H 166.83374 Z M 52.833467,90.225502 101.83306,123.16664 v 5.2e-4 130.99924 H 52.833467 v -130.99924 -5.2e-4 z m 105.999723,0 v 32.941138 5.2e-4 130.99924 H 109.8336 v -130.99924 -5.2e-4 h 5.2e-4 z M 4.8338133,214.16677 H 44.833438 v 40.00014 H 4.8338133 Z m 161.9999267,0 h 39.99963 v 40.00014 h -39.99963 z";

// 1.7A 05
//let p:string = "M -3.1667319,34.166907 V 262.16643 H 214.8334 V 34.166907 Z m 8.0005459,8.00003 H 44.833439 V 82.167078 H 4.833814 Z m 47.999654,0 H 158.8332 V 82.167078 H 52.833468 Z m 114.000272,0 h 39.99963 V 82.167078 H 166.83374 Z M 52.833468,90.166588 H 158.8332 v 5.64e-4 39.999628 l -0.001,5.6e-4 h 0.001 l -52.99987,33.99938 -52.999862,-33.99947 h 0.0011 l -0.0011,-5.7e-4 V 90.167107 Z m -47.999654,5.64e-4 h 39.999625 v 115.999638 5.6e-4 H 4.833814 v -5.6e-4 z m 161.999926,0 h 39.99963 V 206.16674 H 166.83374 Z M 52.833468,139.22509 101.83306,172.16624 v 5.6e-4 h 5.1e-4 v 81.99965 h -5.1e-4 -48.999592 v -81.99965 -5.6e-4 -32.94063 z m 105.999732,0 v 5.7e-4 32.94063 5.6e-4 h 5.6e-4 v 81.99964 h -5.6e-4 -48.9996 v -81.99964 -5.6e-4 h 5.2e-4 z M 4.833814,214.16677 h 39.999625 v 40.00014 H 4.833814 Z m 161.999926,0 h 39.99963 v 40.00014 h -39.99963 z";

let pA:string[];
pA = p.split("z").join("z; ").split("Z").join("Z; ").split("; ");

//[0].split(" ")
let test:SVGTemplate = new SVGTemplate(p);
//let test:Polygon = new Polygon(pA[0]);
let t:Polygon[] = test.subShapes;
let finalPath:string = "";
for(let i:number = 0; i < t.length; ++i) {
    finalPath += " " + t[i].outset().join(" ");
}
console.log(finalPath.trim());
// console.log(test.width);
// console.log(test.height);