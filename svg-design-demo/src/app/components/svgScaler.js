"use strict";
exports.__esModule = true;
exports.SVGTemplate = exports.Polygon = void 0;
// Class for individual polygon object within an SVG design template
var Polygon = /** @class */ (function () {
    // Basic constructor with polygon path and previous polygon's last point (if applicable)
    function Polygon(polyPath, prevPolyPoint) {
        if (prevPolyPoint === void 0) { prevPolyPoint = []; }
        this.prevPolygonPoint = prevPolyPoint;
        this.startingPoint = [];
        this.scalablePath = [];
        this.parsePath(polyPath.split(" "));
        // Getting width and height of polygon
        this.polygonWidth = this.xMax - this.xMin;
        this.polygonHeight = this.yMax - this.yMin;
    }
    // Method to update the mins and maxes of the polygon
    Polygon.prototype.updateMinMax = function (point) {
        if (point === void 0) { point = this.currentPoint; }
        if (point[0] < this.xMin) {
            this.xMin = point[0];
        }
        if (point[0] > this.xMax) {
            this.xMax = point[0];
        }
        if (point[1] < this.yMin) {
            this.yMin = point[1];
        }
        if (point[1] > this.yMax) {
            this.yMax = point[1];
        }
    };
    // Method to reset mins and maxes of polygons to the starting point if it exists
    Polygon.prototype.resetMinMax = function () {
        if (this.startingPoint[0] != null && this.startingPoint[1] != null) {
            // Setting the mins and maxes as the starting point
            this.xMin = this.startingPoint[0];
            this.xMax = this.startingPoint[0];
            this.yMin = this.startingPoint[1];
            this.yMax = this.startingPoint[1];
        }
    };
    // Method to get angle between two vectors (each with two elements)
    Polygon.prototype.vectorAngle = function (v1, v2) {
        // Getting necessary values
        var v1Mag = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
        var v2Mag = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
        var sign = v1[0] * v2[1] - v1[1] * v2[0] < 0 ? -1 : 1;
        var dot = v1[0] * v2[0] + v1[1] * v2[1];
        return sign * Math.acos(dot / (v1Mag * v2Mag));
    };
    // Method to convert from center to endpoint for elliptical arc
    Polygon.prototype.centerToEndpoint = function (cx, cy, rx, ry, phi, theta, dTheta) {
        // Values we need to obtain
        var x1, y1, x2, y2, fA, fS;
        // Getting values for sin/cos of angles (theta2 = theta + dTheta)
        var sinPhi = Math.sin(phi * Math.PI / 180), cosPhi = Math.cos(phi * Math.PI / 180);
        var sinTheta = Math.sin(theta * Math.PI / 180), cosTheta = Math.cos(theta * Math.PI / 180);
        var sinTheta2 = Math.sin((theta + dTheta) * Math.PI / 180), cosTheta2 = Math.cos((theta + dTheta) * Math.PI / 180);
        // Getting endpoint values
        x1 = (cosPhi * rx * cosTheta) - (sinPhi * ry * sinTheta) + cx;
        y1 = (sinPhi * rx * cosTheta) + (cosPhi * ry * sinTheta) + cy;
        x2 = (cosPhi * rx * cosTheta2) - (sinPhi * ry * sinTheta2) + cx;
        y2 = (sinPhi * rx * cosTheta2) + (cosPhi * ry * sinTheta2) + cy;
        fA = Math.abs(dTheta) > 180 ? 1 : 0;
        fS = dTheta > 0 ? 1 : 0;
        return [x1, y1, x2, y2, fA, fS];
    };
    // Method to convert endpoint to center for elliptical arc
    Polygon.prototype.endpointToCenter = function (x1, y1, x2, y2, rx, ry, phi, fA, fS) {
        // Values we need to obtain
        var cx, cy, theta, dTheta;
        // Getting values for sin/cos of angles (theta2 = theta + dTheta)
        var sinPhi = Math.sin(phi * Math.PI / 180), cosPhi = Math.cos(phi * Math.PI / 180);
        // Step 1: getting (x1', y1')
        var x1Prime = cosPhi * ((x1 - x2) / 2) + sinPhi * ((y1 - y2) / 2);
        var y1Prime = -sinPhi * ((x1 - x2) / 2) + cosPhi * ((y1 - y2) / 2);
        // Step 2: getting (cx', cy')
        var rxSquared = rx * rx, rySquared = ry * ry;
        var x1PrimeSquared = x1Prime * x1Prime, y1PrimeSquared = y1Prime * y1Prime;
        var alpha = (x1PrimeSquared / rxSquared) + (y1PrimeSquared / rySquared);
        // Making sure radii are valid
        if (alpha > 1) {
            rx = Math.sqrt(alpha) * rx;
            ry = Math.sqrt(alpha) * ry;
            rxSquared = rx * rx, rySquared = ry * ry;
        }
        var sign = fA == fS ? -1 : 1;
        var scalarValue = sign * Math.sqrt(((rxSquared * rySquared) - (rxSquared * y1PrimeSquared) - (rySquared * x1PrimeSquared)) /
            ((rxSquared * y1PrimeSquared) + (rySquared * x1PrimeSquared)));
        var cxPrime = scalarValue * ((rx * y1Prime) / ry);
        var cyPrime = scalarValue * (-(ry * x1Prime) / rx);
        // Step 3: getting (cx, cy)
        cx = (cosPhi * cxPrime) - (sinPhi * cyPrime) + ((x1 + x2) / 2);
        cy = (sinPhi * cxPrime) + (cosPhi * cyPrime) + ((y1 + y2) / 2);
        // Step 4: getting theta and dTheta
        theta = this.vectorAngle([1, 0], [(x1Prime - cxPrime) / rx, (y1Prime - cyPrime) / ry]);
        dTheta = this.vectorAngle([(x1Prime - cxPrime) / rx, (y1Prime - cyPrime) / ry], [(-x1Prime - cxPrime) / rx, (-y1Prime - cyPrime) / ry]) % 360;
        // Updating dTheta depending on sweep parameter
        if (fS == 0 && dTheta > 0) {
            dTheta -= 360;
        }
        if (fS == 1 && dTheta < 0) {
            dTheta += 360;
        }
        return [cx, cy, theta, dTheta];
    };
    // Method to get mins/maxes for Arc command
    Polygon.prototype.arcMinMax = function (x1, y1, rx, ry, phi, largeArcFlag, sweepFlag, x2, y2) {
    };
    // M 371.96484 266.07422 A 243.65184 116.59413 50 0 0 129.83789 370.70898 z 
    // Method to parse the given array of commands
    Polygon.prototype.parsePath = function (pathArray) {
        var currentChar;
        var nextChars = [];
        var nextPoint = [];
        var diffPoints = [];
        // Ignoring the first M/m command and value as well as final Z command
        for (var i = 0; i < pathArray.length - 1; ++i) {
            currentChar = pathArray[i];
            nextPoint = [];
            diffPoints = [];
            nextChars = [];
            // Getting the next numbers to go with this command
            for (var j = i + 1; "MmLlHhVvZz".indexOf(pathArray[j]) == -1; ++j) {
                nextChars = nextChars.concat(pathArray[j].split(","));
            }
            // Adding the next optimized command to scalablePath based on currentChar
            switch (currentChar) {
                case "M":
                    // Looping for implicit commands (implicit for M are L)
                    for (var j = 0; j < Math.floor(nextChars.length / 2); ++j) {
                        nextPoint = [Number(nextChars[0 + (j * 2)]), Number(nextChars[1 + (j * 2)])];
                        // First command (need it to be absolute)
                        if (i == 0 && j == 0) {
                            this.scalablePath.push("M");
                            this.startingPoint.push(Number(nextChars[0]), Number(nextChars[1]));
                            this.scalablePath.push(nextPoint[0].toString(), nextPoint[1].toString());
                            this.resetMinMax();
                        }
                        else {
                            if (j > 0) {
                                this.scalablePath.push("l");
                            }
                            else {
                                this.scalablePath.push("m");
                            }
                            diffPoints = [nextPoint[0] - this.currentPoint[0], nextPoint[1] - this.currentPoint[1]];
                            this.scalablePath.push(diffPoints[0].toString(), diffPoints[1].toString());
                        }
                        // Updating current point and mins/maxes
                        this.currentPoint = nextPoint;
                        this.updateMinMax();
                    }
                    break;
                case "m":
                    // Looping for implicit commands (implicit for m are l)
                    for (var j = 0; j < Math.floor(nextChars.length / 2); ++j) {
                        // First command
                        if (i == 0 && j == 0) {
                            // Need to start polygon with absolute M
                            this.scalablePath.push("M");
                            // Starting polygon with a relative m  
                            if (this.prevPolygonPoint.length == 0) {
                                this.startingPoint.push(Number(nextChars[0]), Number(nextChars[1]));
                            }
                            // Relative m with a previous polygon
                            else {
                                this.startingPoint.push(this.prevPolygonPoint[0] + Number(nextChars[0]), this.prevPolygonPoint[1] + Number(nextChars[1]));
                            }
                            nextPoint = this.startingPoint;
                            this.scalablePath.push(nextPoint[0].toString(), nextPoint[1].toString());
                            this.resetMinMax();
                        }
                        else {
                            if (j > 0) {
                                this.scalablePath.push("l");
                            }
                            else {
                                this.scalablePath.push("m");
                            }
                            nextPoint = [this.currentPoint[0] + Number(nextChars[0 + (j * 2)]), this.currentPoint[1] + Number(nextChars[1 + (j * 2)])];
                            diffPoints = [nextPoint[0] - this.currentPoint[0], nextPoint[1] - this.currentPoint[1]];
                            this.scalablePath.push(diffPoints[0].toString(), diffPoints[1].toString());
                        }
                        // Updating current point and mins/maxes
                        this.currentPoint = nextPoint;
                        this.updateMinMax();
                    }
                    break;
                case "L":
                    // Looping for implicit commands (implicit for L are L)
                    for (var j = 0; j < Math.floor(nextChars.length / 2); ++j) {
                        nextPoint = [Number(nextChars[0 + (j * 2)]), Number(nextChars[1 + (j * 2)])];
                        diffPoints = [nextPoint[0] - this.currentPoint[0], nextPoint[1] - this.currentPoint[1]];
                        this.scalablePath.push("l", diffPoints[0].toString(), diffPoints[1].toString());
                        // Updating current point and mins/maxes
                        this.currentPoint = nextPoint;
                        this.updateMinMax();
                    }
                    break;
                case "l":
                    // Looping for implicit commands (implicit for l are l)
                    for (var j = 0; j < Math.floor(nextChars.length / 2); ++j) {
                        nextPoint = [this.currentPoint[0] + Number(nextChars[0 + (j * 2)]), this.currentPoint[1] + Number(nextChars[1 + (j * 2)])];
                        diffPoints = [nextPoint[0] - this.currentPoint[0], nextPoint[1] - this.currentPoint[1]];
                        this.scalablePath.push("l", diffPoints[0].toString(), diffPoints[1].toString());
                        // Updating current point and mins/maxes
                        this.currentPoint = nextPoint;
                        this.updateMinMax();
                    }
                    break;
                case "H":
                    // Looping for implicit commands (implicit for H are H)
                    for (var j = 0; j < Math.floor(nextChars.length / 1); ++j) {
                        // Getting nextpoint and difference from current
                        nextPoint = [Number(nextChars[j]), this.currentPoint[1]];
                        diffPoints = [nextPoint[0] - this.currentPoint[0], 0];
                        this.scalablePath.push("h", diffPoints[0].toString());
                        // Updating current point and mins/maxes
                        this.currentPoint = nextPoint;
                        this.updateMinMax();
                    }
                    break;
                case "h":
                    // Looping for implicit commands (implicit for H are H)
                    for (var j = 0; j < Math.floor(nextChars.length / 1); ++j) {
                        // Getting nextpoint and difference from current
                        nextPoint = [this.currentPoint[0] + Number(nextChars[j]), this.currentPoint[1]];
                        diffPoints = [nextPoint[0] - this.currentPoint[0], 0];
                        this.scalablePath.push("h", diffPoints[0].toString());
                        // Updating current point and mins/maxes
                        this.currentPoint = nextPoint;
                        this.updateMinMax();
                    }
                    break;
                case "V":
                    // Looping for implicit commands (implicit for V are V)
                    for (var j = 0; j < Math.floor(nextChars.length / 1); ++j) {
                        // Getting nextpoint and difference from current
                        nextPoint = [this.currentPoint[0], Number(nextChars[j])];
                        diffPoints = [0, nextPoint[1] - this.currentPoint[1]];
                        this.scalablePath.push("v", diffPoints[1].toString());
                        // Updating current point and mins/maxes
                        this.currentPoint = nextPoint;
                        this.updateMinMax();
                    }
                    break;
                case "v":
                    // Looping for implicit commands (implicit for v are v)
                    for (var j = 0; j < Math.floor(nextChars.length / 1); ++j) {
                        // Getting nextpoint and difference from current
                        nextPoint = [this.currentPoint[0], this.currentPoint[1] + Number(nextChars[j])];
                        diffPoints = [0, nextPoint[1] - this.currentPoint[1]];
                        this.scalablePath.push("v", diffPoints[1].toString());
                        // Updating current point and mins/maxes
                        this.currentPoint = nextPoint;
                        this.updateMinMax();
                    }
                    break;
                case "C":
                    nextPoint = [Number(nextChars[4]), Number(nextChars[5])];
                    this.scalablePath.push("c");
                    for (var i_1 = 0; i_1 < nextChars.length; ++i_1) {
                        diffPoints.push(Number(nextChars[i_1]) - this.currentPoint[i_1 % 2]);
                        this.scalablePath.push(diffPoints[i_1].toString());
                    }
                    break;
                case "c":
                    nextPoint = [this.currentPoint[0] + Number(nextChars[4]), this.currentPoint[1] + Number(nextChars[5])];
                    this.scalablePath.push("c");
                    for (var i_2 = 0; i_2 < nextChars.length; ++i_2) {
                        diffPoints.push(Number(nextChars[i_2]));
                        this.scalablePath.push(diffPoints[i_2].toString());
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
                    for (var j = 0; j < nextChars.length; ++j) {
                        diffPoints.push(Number(nextChars[j]) - this.currentPoint[j % 2]);
                        this.scalablePath.push(diffPoints[j].toString());
                    }
                    break;
                case "q":
                    nextPoint = [this.currentPoint[0] + Number(nextChars[2]), this.currentPoint[1] + Number(nextChars[3])];
                    this.scalablePath.push("q");
                    for (var j = 0; j < nextChars.length; ++j) {
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
                    for (var j = 0; j < Math.floor(nextChars.length / 7); ++j) {
                        nextPoint = [Number(nextChars[5 + (j * 7)]), Number(nextChars[6 + (j * 7)])];
                        this.scalablePath.push("a");
                        diffPoints = [nextPoint[0] - this.currentPoint[0], nextPoint[1] - this.currentPoint[1]];
                        for (var k = 0; k < 5; ++k) {
                            this.scalablePath.push(nextChars[k + (j * 7)]);
                        }
                        this.scalablePath.push(diffPoints[0].toString(), diffPoints[1].toString());
                        // Updating current point and mins/maxes
                        this.currentPoint = nextPoint;
                        this.updateMinMax();
                    }
                    break;
                case "a":
                    // Looping for implicit commands
                    for (var j = 0; j < Math.floor(nextChars.length / 7); ++j) {
                        if (j > 0) {
                            this.currentPoint = nextPoint;
                            this.updateMinMax();
                        }
                        nextPoint = [this.currentPoint[0] + Number(nextChars[5 + (j * 7)]), this.currentPoint[1] + Number(nextChars[6 + (j * 7)])];
                        this.scalablePath.push("a");
                        diffPoints = [nextPoint[0], nextPoint[1]];
                        for (var k = 0; k < 5; ++k) {
                            this.scalablePath.push(nextChars[k + (j * 7)]);
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
    };
    // Method to return outset polygon
    Polygon.prototype.outset = function (xOutset, yOutset) {
        var scaleX = (this.polygonWidth + (xOutset * 2)) / this.polygonWidth;
        var scaleY = (this.polygonHeight + (yOutset * 2)) / this.polygonHeight;
        var centerPoint = [this.polygonWidth / 2 + this.xMin, this.polygonHeight / 2 + this.yMin];
        var scaledPath = this.scalablePath.slice();
        var differenceFromCenter = [Number(scaledPath[1]) - centerPoint[0], Number(scaledPath[2]) - centerPoint[1]];
        // Changing starting point to be scaled now
        scaledPath[1] = (centerPoint[0] + (differenceFromCenter[0] * (scaleX))).toString();
        scaledPath[2] = (centerPoint[1] + (differenceFromCenter[1] * scaleY)).toString();
        this.currentPoint = [Number(scaledPath[1]), Number(scaledPath[2])];
        var nextPoint;
        var diffPoints;
        var nextChars;
        for (var i = 3; i < scaledPath.length - 1; ++i) {
            nextPoint = [];
            diffPoints = [];
            nextChars = [];
            // Getting the next numbers to go with this command
            for (var j = i + 1; "MmLlHhVvZz".indexOf(scaledPath[j]) == -1; ++j) {
                nextChars = nextChars.concat(scaledPath[j].split(","));
            }
            switch (scaledPath[i]) {
                case "m":
                case "l":
                    nextPoint = [this.currentPoint[0] + (Number(nextChars[0]) * scaleX), this.currentPoint[1] + (Number(nextChars[1]) * scaleY)];
                    diffPoints = [nextPoint[0] - this.currentPoint[0], nextPoint[1] - this.currentPoint[1]];
                    // Updating with new scaled values
                    for (var k = 0; k < diffPoints.length; ++k) {
                        scaledPath[i + (k + 1)] = diffPoints[k].toString();
                    }
                    break;
                case "h":
                    nextPoint = [this.currentPoint[0] + (Number(nextChars[0]) * scaleX), this.currentPoint[1]];
                    diffPoints = [nextPoint[0] - this.currentPoint[0], 0];
                    // Updating with new scaled values
                    scaledPath[i + 1] = diffPoints[0].toString();
                    break;
                case "v":
                    nextPoint = [this.currentPoint[0], this.currentPoint[1] + (Number(nextChars[0]) * scaleY)];
                    diffPoints = [0, nextPoint[1] - this.currentPoint[1]];
                    // Updating with new scaled values
                    scaledPath[i + 1] = diffPoints[1].toString();
                    break;
                case "c":
                    nextPoint = [this.currentPoint[0] + (Number(nextChars[4]) * scaleX), this.currentPoint[1] + (Number(nextChars[5]) * scaleY)];
                    for (var k = 0; k < nextChars.length; ++k) {
                        if (k % 2 == 0) {
                            diffPoints.push(Number(nextChars[k]) * scaleX);
                        }
                        else {
                            diffPoints.push(Number(nextChars[k]) * scaleY);
                        }
                        scaledPath[i + (k + 1)] = diffPoints[k].toString();
                    }
                    break;
                // s will be added later (adds onto c)
                case "s":
                    break;
                case "q":
                    nextPoint = [this.currentPoint[0] + (Number(nextChars[2]) * scaleX), this.currentPoint[1] + (Number(nextChars[3]) * scaleY)];
                    for (var k = 0; k < nextChars.length; ++k) {
                        if (k % 2 == 0) {
                            diffPoints.push(Number(nextChars[k]) * scaleX);
                        }
                        else {
                            diffPoints.push(Number(nextChars[k]) * scaleY);
                        }
                        scaledPath[i + (k + 1)] = diffPoints[k].toString();
                    }
                    break;
                // t will be added later (adds onto q)
                case "t":
                    break;
                case "a":
                    nextPoint = [this.currentPoint[0] + (Number(nextChars[5]) * scaleX), this.currentPoint[1] + (Number(nextChars[6]) * scaleY)];
                    for (var k = 0; k < nextChars.length; ++k) {
                        // Keep same angle, sweep flag, etc.
                        if (k >= 2 && k <= 4) {
                            diffPoints.push(Number(nextChars[k]));
                        }
                        else if (k % 2 == 0) {
                            diffPoints.push(Number(nextChars[k]) * scaleX);
                        }
                        else {
                            diffPoints.push(Number(nextChars[k]) * scaleY);
                        }
                        scaledPath[i + (k + 1)] = diffPoints[k].toString();
                    }
                    break;
                default:
                    continue;
            }
            // Updating current point
            this.currentPoint = nextPoint;
        }
        return scaledPath.join(" ").trim();
    };
    // Method to return scalable path
    Polygon.prototype.getScalablePath = function () { return this.scalablePath.join(" "); };
    return Polygon;
}());
exports.Polygon = Polygon;
// Class for an SVG design template
var SVGTemplate = /** @class */ (function () {
    // Basic constructor which takes d attribute (string)
    function SVGTemplate(svgPath) {
        this.polygonPaths = svgPath.split("z").join("z; ").split("Z").join("Z; ").split("; ");
        this.subShapes = [];
        // Looping through subshapes to add each subpolygon to the polygon array
        for (var i = 0; i < this.polygonPaths.length; ++i) {
            if (this.polygonPaths[i].length == 0) {
                continue;
            }
            if (i > 0) {
                this.subShapes.push(new Polygon(this.polygonPaths[i].trim(), this.subShapes[i - 1].startingPoint));
            }
            else {
                this.subShapes.push(new Polygon(this.polygonPaths[i].trim()));
            }
            // Updating mins and maxes
            if (i === 0 || this.subShapes[i].xMin < this.xMin) {
                this.xMin = this.subShapes[i].xMin;
            }
            if (i === 0 || this.subShapes[i].xMax > this.xMax) {
                this.xMax = this.subShapes[i].xMax;
            }
            if (i === 0 || this.subShapes[i].yMin < this.yMin) {
                this.yMin = this.subShapes[i].yMin;
            }
            if (i === 0 || this.subShapes[i].yMax > this.yMax) {
                this.yMax = this.subShapes[i].yMax;
            }
        }
        // Getting starting point for template
        this.startingPoint = this.subShapes[0].startingPoint;
        this.width = this.xMax - this.xMin;
        this.height = this.yMax - this.yMin;
        this.outerEdgeIndex = 0;
        // Identifying outer edge of template (rest is the panes)
        for (var i = 0; i < this.subShapes.length; ++i) {
            if (this.subShapes[i].polygonWidth == this.width && this.subShapes[i].polygonHeight == this.height) {
                this.outerEdgeIndex = i;
            }
        }
    }
    // Method to access the templates' optimized svg d attribute
    SVGTemplate.prototype.getOptimizedD = function () {
        var optimizedD = "";
        for (var i = 0; i < this.subShapes.length; ++i) {
            optimizedD += this.subShapes[i].getScalablePath() + " ";
        }
        return optimizedD.trim();
    };
    // Method to get a scaled version of the template --> returns [scaledD, newScaleX, newScaleY]
    SVGTemplate.prototype.getScaledD = function (scaleX, scaleY) {
        var scaledD = "";
        // Getting outset values for reducing wallwidth in x/y
        var xOutset = (4 * this.width * (scaleX - 1)) / (scaleX * this.width - 8);
        var yOutset = (4 * this.height * (scaleY - 1)) / (scaleY * this.height - 8);
        // Getting new scale values
        var newScaleX = (scaleX * this.width) / (this.width - (2 * xOutset));
        var newScaleY = (scaleY * this.height) / (this.height - (2 * yOutset));
        // Looping through and outsetting each polygon by a certain value
        for (var i = 0; i < this.subShapes.length; ++i) {
            if (i == this.outerEdgeIndex) {
                scaledD += this.subShapes[i].outset(-xOutset, -yOutset) + " ";
            }
            else {
                scaledD += this.subShapes[i].outset(xOutset, yOutset) + " ";
            }
        }
        return [scaledD.trim(), newScaleX.toString(), newScaleY.toString()];
    };
    // Method to get panes for laser cutting
    SVGTemplate.prototype.getLaserCutPanes = function (scaleX, scaleY) {
        if (scaleX === void 0) { scaleX = 1; }
        if (scaleY === void 0) { scaleY = 1; }
        var result = "";
        // Getting outset values for reducing wallwidth in x/y
        var xOutset = (4 * this.width * (scaleX - 1)) / (scaleX * this.width - 8);
        var yOutset = (4 * this.height * (scaleY - 1)) / (scaleY * this.height - 8);
        // Getting new scale values
        var newScaleX = (scaleX * this.width) / (this.width - (2 * xOutset));
        var newScaleY = (scaleY * this.height) / (this.height - (2 * yOutset));
        // Looping through each pane and outsetting by 2mm so pane will fit in aperture
        for (var i = 0; i < this.subShapes.length; ++i) {
            if (i != this.outerEdgeIndex) {
                result += this.subShapes[i].outset(2, 2) + " ";
            }
        }
        return [result.trim(), newScaleX.toString(), newScaleY.toString()];
    };
    return SVGTemplate;
}());
exports.SVGTemplate = SVGTemplate;
function getBoundingBox(annotation) {
    var xmin, xmax, ymin, ymax;
    var path = annotation;
    path = path.replace(/[a-z].*/g, " ").replace(/[\sA-Z]+/gi, " ").trim();
    var coordinate_list = path.split(" ");
    for (var _i = 0, coordinate_list_1 = coordinate_list; _i < coordinate_list_1.length; _i++) {
        var coordinate = coordinate_list_1[_i];
        if (coordinate.length > 1) {
            var initial_coordinate = coordinate.split(",");
            xmin = xmax = initial_coordinate[0];
            ymin = ymax = initial_coordinate[1];
            break;
        }
    }
    for (var _a = 0, coordinate_list_2 = coordinate_list; _a < coordinate_list_2.length; _a++) {
        var coordinate = coordinate_list_2[_a];
        var xycoord = coordinate.split(",");
        if (!xycoord[1]) {
            // ignore relative movements
            xycoord[0] = xmin;
            xycoord[1] = ymin;
        }
        xmin = Math.min(xmin, xycoord[0]);
        xmax = Math.max(xmax, xycoord[0]);
        ymin = Math.min(ymin, xycoord[1]);
        ymax = Math.max(ymax, xycoord[1]);
    }
    return [[xmin, ymax], [xmax, ymin]];
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
// let p:string = "M -3.1667319 34.166907 v 227.99952299999998 h 218.0001319 v -227.99952299999998 Z M 4.833814 42.166937000000004 h 39.999624999999995 v 40.000141 h -39.999624999999995 Z M 52.833467999999996 42.166937000000004 h 105.99973200000001 v 40.000141 h -105.999732 Z M 166.83373999999998 42.166937000000004 h 39.999629999999996 v 40.000141 h -39.99962999999997 Z M 52.833468 90.166588 h 105.999732 v 0.0005639999999971224 v 39.999628000000016 l -0.0010000000000047748 0.0005600000000072214 h 0.0010000000000047748 l -52.99987 33.99938 l -52.999862 -33.99947 h 0.001100000000000989 l -0.001100000000000989 -0.0005700000000103955 v -39.99957300000001 Z M 4.833814000000004 90.167152 h 39.999625 v 115.99963799999999 v 0.0005600000000072214 h -39.99962500000001 v -0.0005600000000072214 Z M 166.83373999999998 90.167152 h 39.999629999999996 v 115.999588 h -39.99962999999997 Z M 52.833468 139.22509 l 48.999592 32.94114999999999 v 0.0005600000000072214 h 0.0005100000000055616 v 81.99965 h -0.0005100000000055616 h -48.999592 v -81.99965 v -0.0005600000000072214 v -32.94063 Z M 158.8332 139.22509 v 0.0005700000000103955 v 32.94063 v 0.0005600000000072214 h 0.0005600000000072214 v 81.99964 h -0.0005600000000072214 h -48.9996 v -81.99964 v -0.0005600000000072214 h 0.0005199999999945248 Z M 4.833814 214.16677 h 39.999624999999995 v 40.000140000000016 h -39.999624999999995 Z M 166.83373999999998 214.16677 h 39.999629999999996 v 40.000140000000016 h -39.999629999999996 Z";
// D's for 1.8A: 1,2,3,4
// let p:string = "M -1.9848173 26.294517 v 227.99974300000002 h 218.0001373 v -227.99974300000002 Z M 6.014970699999999 34.294305 h 63.999954300000006 v 92.000045 h -63.999954300000006 Z M 78.015262 34.294305 h 23.999917999999994 v 92.000045 h -23.999917999999994 Z M 112.01533 34.294305 h 23.99991 v 92.000045 h -23.99991 Z M 144.01503 34.294305 h 63.999949999999984 v 92.000045 h -63.999949999999984 Z M 6.0149707 134.29469 h 97.00010929999999 v 47.99983 h -97.00010929999999 Z M 111.01542 134.29469 h 96.99956 v 47.99983 h -96.99956 Z M 6.0149707 190.2943 h 202.00000930000002 v 56.00017 h -202.00000930000002 Z";
// let p:string = "M -4.6037934 23.613402 v 227.99973799999998 h 218.0001434 v -227.99973799999998 Z M 3.3959946 31.613192 h 63.9999544 v 212.000158 h -63.9999544 Z M 75.39628599999999 31.613192 h 23.999916000000013 v 212.000158 h -23.999916 Z M 108.39643999999998 31.613192 h 23.999920000000003 v 212.000158 h -23.999920000000003 Z M 140.39614999999998 31.613192 h 63.99995000000001 v 212.000158 h -63.99995000000001 Z";
// let p:string = "M -3.1667353 38.912085 v 227.999735 h 218.0001353 v -227.999735 Z M 4.8330522 46.911873 h 97.00010780000001 v 40.000038 h -97.00010780000001 Z M 109.8335 46.911873 h 96.99955999999999 v 40.000038 h -96.99955999999999 Z M 4.8330522 94.912251 h 24.0004658 v 40.00004899999999 h -24.0004658 Z M 36.833304 94.912251 h 31.999702999999997 v 40.00004899999999 h -31.999702999999997 Z M 76.833344 94.912251 h 23.999916 v 40.00004899999999 h -23.999916 Z M 109.83349999999999 94.912251 h 23.99991 v 40.00004899999999 h -23.999909999999986 Z M 141.83319999999998 94.912251 h 32.00026 v 40.00004899999999 h -32.00025999999997 Z M 181.83324 94.912251 h 23.999920000000003 v 40.00004899999999 h -23.999920000000003 Z M 4.8330522 142.91209 h 63.9999548 v 115.99994000000001 h -63.9999548 Z M 76.833344 142.91209 h 23.999916 v 62.000140000000016 h -23.999916 Z M 109.83349999999999 142.91209 h 23.99991 v 62.000140000000016 h -23.999909999999986 Z M 141.83319999999998 142.91209 h 63.99995999999999 v 115.99994000000001 h -63.99995999999996 Z M 76.83334399999998 210.91221000000002 h 23.999916 v 47.99982 h -23.999915999999985 Z M 109.83349999999999 210.91221000000002 h 23.99991 v 47.99982 h -23.999909999999986 Z";
// let p:string = "M -3.1667353 31.003277 v 227.99973300000002 h 218.0001353 v -227.99973300000002 Z M 4.8330522 39.003065 h 202.0000078 v 32.000251999999996 h -202.0000078 Z M 4.8330522 79.00310300000001 h 40.000038800000006 v 172.000117 h -40.000038800000006 Z M 52.833431 79.00310300000001 h 105.999799 v 48.00038699999999 h -105.999799 Z M 166.83302 79.00310300000001 h 40.000039999999984 v 172.000117 h -40.000039999999984 Z M 52.833431 135.00328 h 105.999799 v 115.99994000000001 h -105.999799 Z";
// let test:SVGTemplate = new SVGTemplate(p);
// let result:string[] = test.getScaledD(2, 2);
// console.log(test.getLaserCutPanes());
var p = new Polygon("M 53.500104,202.85528 A 266.76195,127.65296 50 0 0 295.62705,98.220523 Z");
console.log(p.endpointToCenter(371.97, 266.07, 129.84, 370.71, 243.65, 116.59, 50, 0, 0));
console.log(getBoundingBox("M 53.500104,202.85528 A 266.76195,127.65296 50 0 0 295.62705,98.220523 Z"));
