/*
This script provides modules for generating picture frames with 
varying dimensions/properties. OpenScad polygons or SVG files of 
the rail profile as well as their corresponding dimensions are 
necessary.
*/

function changeElement(arr, index, value) = [for(i = [0:len(arr)-1]) if(i == index) value else arr[i]];
    
function change2DElement(arr, index, subArr) = [for(i = [0:len(arr)-1]) if(i == index) subArr else arr[i]];

// Function to do vector addition recursively through array
function vectorAddition(largeVector, start, end) = (start == end) ? [largeVector[start][0], largeVector[start][1]] : [largeVector[start][0], largeVector[start][1]] + vectorAddition(largeVector, start + 1, end);

function midpoint(p1, p2) = (p1 + p2)/2;

// Module to create frame from polygon profile (not used much)
module frame(xDim, yDim, polyPoints, polyPath, shapeWidth, shapeHeight) {
    // Creates frame using a polygon and the frame dimensions
    
    // Creating bottom frame and cutting the overlap
    difference() {
        rotate([90, 0, 0]) {
            linear_extrude(height = yDim) {
                polygon(polyPoints, polyPath);
            }
        }
        // bottom right triangle
        linear_extrude(height = shapeHeight) {
            polygon([[0, -yDim], [shapeWidth, -yDim + shapeWidth], [shapeWidth, -yDim]], [[0, 1, 2]]);
        }
        // bottom left triangle
        linear_extrude(height = shapeHeight) {
            polygon([[0, 0], [shapeWidth, 0], [shapeWidth, -shapeWidth]], [[0, 1, 2]]);
        }
    }
    
    // Creating left frame and cutting the overlap
    difference() {
        translate([0, -shapeWidth, 0]) {
            rotate([90, 0, 90]) {
                linear_extrude(height = xDim) {
                    polygon(polyPoints, polyPath);
                }
            }
         }
         
        // bottom left triangle
        linear_extrude(height = shapeHeight) {
            polygon([[0, 0], [0, -shapeWidth], [shapeWidth, -shapeWidth]], [[0, 1, 2]]);
        }
        // top left triangle
        linear_extrude(height = shapeHeight) {
            polygon([[xDim, 0], [xDim - shapeWidth, -shapeWidth], [xDim, -shapeWidth]], [[0, 1, 2]]);
        }
    }
    
    // Creating right frame and cutting the overlap
    difference() {
        translate([0, -yDim, 0]) {
            rotate([90, 0, 90]) {
                linear_extrude(height = xDim) {
                    polygon(polyPoints, polyPath);
                }
            }
        }

        // bottom right triangle
        linear_extrude(height = shapeHeight) {
            polygon([[0, -yDim], [0, -yDim + shapeWidth], [shapeWidth, -yDim + shapeWidth]], [[0, 1, 2]]);
        }
        // top right triangle
        linear_extrude(height = shapeHeight) {
            polygon([[xDim, -yDim], [xDim, -yDim + shapeWidth], [xDim - shapeWidth, -yDim + shapeWidth]], [[0, 1, 2]]);
        }
    }
    
    // Creating top frame and cutting the overlap
    difference() {
        translate([xDim - shapeWidth, 0, 0]) {
            rotate([90, 0, 0]) {
                linear_extrude(height = yDim) {
                    polygon(polyPoints, polyPath);
                }
            }
        }
        
        // top right triangle
        linear_extrude(height = shapeHeight) {
            polygon([[xDim, -yDim], [xDim - shapeWidth, -yDim], [xDim - shapeWidth, -yDim + shapeWidth]], [[0, 1, 2]]);
        }
        // top left triangle
        linear_extrude(height = shapeHeight) {
            polygon([[xDim, 0], [xDim - shapeWidth, 0], [xDim - shapeWidth, -shapeWidth]], [[0, 1, 2]]);
        }
    }
}

// Module to create a frame from an SVG design / frame properties
module frameSVG(xDim, yDim, svgPath, shapeWidth, shapeHeight) {
    // Creates frame using a polygon and the frame dimensions
    safetyNum = yDim*xDim;
    // Creating right frame and cutting the overlap
    difference() {
            translate([0, -yDim, 0]) {
                rotate([90, 0, 180]) {
                    linear_extrude(height = yDim) {
                        translate([-shapeWidth/2, shapeHeight/2, 0]) {
                            import(svgPath, center = true);
                        }
                    }
                }
            }
            // top right triangle
            translate([0, 0, -shapeHeight])
            linear_extrude(height = shapeHeight*5) {
                polygon([[0, -yDim], [0, -safetyNum], [safetyNum, -yDim], [shapeWidth, -yDim + shapeWidth]], [[0, 1, 2, 3]]);
            }
            // bottom right triangle
            translate([0, 0, -shapeHeight])
            linear_extrude(height = shapeHeight*5) {
                polygon([[0, 0], [0, safetyNum], [safetyNum, 0], [shapeWidth, -shapeWidth]], [[0, 1, 2, 3]]);
            }
    }
    
    // Creating bottom frame and cutting the overlap
    difference() {
        translate([0, -shapeWidth, 0]) {
            rotate([90, 0, 90]) {
                linear_extrude(height = xDim) {
                    translate([shapeWidth/2, shapeHeight/2, 0]) {
                        import(svgPath, center = true);
                    }
                }
            }
         }
         
        // bottom right triangle
        translate([0, 0, -shapeHeight])
        linear_extrude(height = shapeHeight*5) {
            polygon([[0, 0], [-safetyNum, 0], [0, -safetyNum], [shapeWidth, -shapeWidth]], [[0, 1, 2, 3]]);
        }
        
        // bottom left triangle
        translate([0, 0, -shapeHeight])
        linear_extrude(height = shapeHeight*5) {
            polygon([[xDim, 0], [safetyNum, 0], [xDim, -safetyNum], [xDim - shapeWidth, -shapeWidth]], [[0, 1, 2, 3]]);
        }
    }
    
    // Creating top frame and cutting the overlap
    difference() {
        translate([xDim, -yDim + shapeWidth, 0]) {
            rotate([90, 0, 270]) {
                linear_extrude(height = xDim) {
                    translate([shapeWidth/2, shapeHeight/2, 0]) {
                        import(svgPath, center = true);
                    }
                }
            }
        }

        // top right triangle
        translate([0, 0, -shapeHeight])
        linear_extrude(height = shapeHeight*5) {
            polygon([[0, -yDim], [-safetyNum, -yDim], [0, safetyNum], [shapeWidth, -yDim + shapeWidth]], [[0, 1, 2, 3]]);
        }
        // top left triangle
        translate([0, 0, -shapeHeight])
        linear_extrude(height = shapeHeight*5) {
            polygon([[xDim, -yDim], [safetyNum, yDim], [xDim, safetyNum], [xDim - shapeWidth, -yDim + shapeWidth]], [[0, 1, 2, 3]]);
        }
    }
    
    // Creating left frame and cutting the overlap
    difference() {
        translate([xDim - shapeWidth, 0, 0]) {
            rotate([90, 0, 0]) {
                linear_extrude(height = yDim) {
                    translate([shapeWidth/2, shapeHeight/2, 0]) {
                        import(svgPath, center = true);
                    }
                }
            }
        }
        
        // top left triangle
        translate([0, 0, -shapeHeight])
        linear_extrude(height = shapeHeight*5) {
            polygon([[xDim, -yDim], [xDim, -safetyNum], [-safetyNum, -yDim+shapeWidth], [xDim - shapeWidth, -yDim + shapeWidth]], [[0, 1, 2, 3]]);
        }
        // bottom left triangle
        translate([0, 0, -shapeHeight])
        linear_extrude(height = shapeHeight*5) {
            polygon([[xDim, 0], [xDim, safetyNum], [-safetyNum, 0], [xDim - shapeWidth, -shapeWidth]], [[0, 1, 2, 3]]);
        }
    }
}

// Module to create n-sided frame from an SVG design
module weirdFrameSVG(sideLength, numPoints, svgPath, shapeWidth, shapeHeight) {
    // Creates frame using an SVG file, numSides, and sideLength
    // must be equal side lengths (hexagons, octagons, etc.)
    
    // Angle of shape between sides
    angle = 180 - (((numPoints-2)*180)/numPoints);
    
    // Each point's vector to the next point
    directions = [for(i = [0:numPoints]) [sideLength*cos(i*angle), -sideLength*sin(i*angle)]];
    
    // Outer points/vertices
    points = [for(i = [0:numPoints]) if(i == 0) [0, 0] else vectorAddition(directions, 0, i-1)];
    
    // Looping through each point to create the border
    for(j = [0:numPoints-1]) {
        currentPoint = points[j];
        
        // Used to make sure the excess is cut 
        safetyNum = sideLength * sideLength;
        
        // Creating edge and cutting corners
        difference() {
            // Moving edges in direction for half of side length
            translate([(sideLength/2)*directions[j][0]/sideLength, (sideLength/2)*directions[j][1]/sideLength, 0]) {
                // Bringing edge centers to outer points
                translate([currentPoint[0], currentPoint[1], 0]) {
                    // Bringing edges in half of their width
                    translate([(shapeWidth/2)*cos(90+j*angle), -(shapeWidth/2)*sin(90+j*angle), 0]) {
                        rotate([90, 0, 90-(j)*angle]) {
                            linear_extrude(height = sideLength, center = true) {
                                import(svgPath, center = true);
                            }
                        }  
                    } 
                }
            }
            
            // Points used for cutting the corners
            cuttingPoints = (numPoints % 2 == 0) ? [for(i = [0:numPoints-1]) [(i+(numPoints/2))%numPoints, (i+(numPoints/2)+1)%numPoints]] : [for(i = [0:numPoints-1]) [(i+floor(numPoints/2))%numPoints, (i+floor(numPoints/2)+1)%numPoints, (i+floor(numPoints/2)+2)%numPoints]]; 
            
            // *********** OLD NO TRIANGLE FUNCTIONALITY ********
            // Right side cut
//            translate([0, 0, -shapeHeight]) {
//                linear_extrude(height = safetyNum) {
//                    polygon([points[j], (numPoints % 2 == 0) ? points[cuttingPoints[j][0]] : midpoint(points[cuttingPoints[j][0]], points[cuttingPoints[j][1]]), (j == 0) ? points[numPoints-1] : points[j-1]], [[0, 1, 2]]);
//                }
//            }
//            
//            // Left side cut
//            translate([0, 0, -shapeHeight]) {
//                linear_extrude(height = safetyNum) {
//                    polygon([points[j+1], (numPoints % 2 == 0) ? points[cuttingPoints[j][1]] : midpoint(points[cuttingPoints[j][1]], points[cuttingPoints[j][2]]), (j == numPoints-1) ? points[1] : points[j+2]], [[0, 1, 2]]);
//                }
//            }
            // END OF CODE WITHOUT TRIANGLE FUNCTIONALITY 
            
            
            // Right side cut
            translate([0, 0, -shapeHeight]) {
                linear_extrude(height = safetyNum) {
                    polygon([
                    // Start point is current point
                    points[j], 
                    
                    // 2nd point is point across from start point
                    (numPoints % 2 == 0) ? points[cuttingPoints[j][0]] : midpoint(points[cuttingPoints[j][0]], points[cuttingPoints[j][1]]), 
                    
                    // Last point is prev point a.k.a -1 from j (even)
                    (numPoints%2 == 0) ? ((j == 0) ? points[numPoints-1] : points[j-1]) : 
                    // Last point is sliced back through midpoint of
                    // current point and previous points
                    safetyNum*(midpoint(points[(j == 0) ? numPoints-1 : j-1], points[j]) - midpoint(points[cuttingPoints[j][0]], points[cuttingPoints[j][1]])) + midpoint(points[cuttingPoints[j][0]], points[cuttingPoints[j][1]])], [[0, 1, 2]]);
                }
            }
            
            // Left side cut
            translate([0, 0, -shapeHeight]) {
                linear_extrude(height = safetyNum) {
                    polygon([
                    // Start point is next point
                    points[j+1], 
                    
                    // 2nd Point is point across from start point
                    (numPoints % 2 == 0) ? points[cuttingPoints[j][1]] : midpoint(points[cuttingPoints[j][1]], points[cuttingPoints[j][2]]),     
                    // Last point is +2 from current point (even)
                    (numPoints% 2 == 0) ? (j == numPoints-1) ? points[1] : points[j+2] : 
                    // Last point is sliced back through midpoint of
                    // the +1 and +2 points from j
                    safetyNum*(midpoint(points[(j == numPoints-1) ? 1 : j+2], points[j+1]) - midpoint(points[cuttingPoints[j][1]], points[cuttingPoints[j][2]])) + midpoint(points[cuttingPoints[j][1]], points[cuttingPoints[j][2]])], [[0, 1, 2]]);
                }
            }
       
        // end of diff
        }
    // end of for
    }
// end of module
}

// Module to create top frame with screw holes
module topFrameSVG(topFrameX, topFrameY, bottomFrameX, bottomFrameY, bottomHeight, svgPath, topWidth, topHeight, screwDiam = 5, screwPitch = .70, screwLength = 15) {
    difference() {
        // Creating top frame piece
        translate([-(frameX-bottomFrameX)/2, (frameY-bottomFrameY)/2, bottomHeight])
        frameSVG(topFrameX,topFrameY, svgPath, topWidth, topHeight);
        
        // Getting inner dimensions
        innerX = topFrameX - (2*topWidth);
        innerY = topFrameY - (2*topWidth);
        
        
        bottomWidth = (bottomFrameX - innerX)/2;
        
        // Adding screw holes
        translate([0, 0, 3])
        rectangleScrews(bottomFrameX, bottomFrameY, bottomWidth/2, screwDiam, screwPitch, screwLength);
        
        // Cutting 6x6 well
        translate([-(frameX-bottomFrameX)/2 + topWidth-6, (frameY-bottomFrameY)/2 -(topWidth-6), bottomHeight])
        frame(12 + innerX, 12 + innerY, [[0, 0], [6, 0], [6, 6], [0, 6]], [[0, 1, 2, 3]], 6, 6);
    } 
}

// Module to generate bottom frame with screw holes, hangers, clips
module bottomFrameSVG(bottomFrameX, bottomFrameY, svgPath, bottomWidth, bottomHeight, hangersOn = true, clipType = 0, screwDiam = 5, screwPitch = .70, screwLength = 15) {
    
    // Hanger info
    hangerPocketWidth = 44;
    hangerPocketHeight = 15;
    hangerPocketDepth = 6.1;

    hangerWidth = 44;
    hangerHeight = 10;
    hangerDepth = 3;
    
    // Clip pocket info
    pocketWidth = 22.247;
    pocketHeight = 12.108;
    
    // Clip info
    clip = "clip.svg";
    clipPocket = "clipPocket.svg";

    clipWidth = 5.008;
    clipHeight = 18.956;
    clipDepth = 5;

    
    difference() {
        frameSVG(bottomFrameX,bottomFrameY, bottomV3, bottomWidth, bottomHeight); 
        //translate([0, 0, 9])
        //frameSVG(frameX,frameY, frame3Top, desWidth, desHeight); 

        // top hanger box
        translate([bottomFrameX/2, hangerPocketHeight/2 - bottomWidth - 5.1, hangerPocketDepth/2 -.1])
        cube([hangerPocketWidth, hangerPocketHeight, hangerPocketDepth], center = true);
        
        translate([bottomFrameX/2, hangerPocketHeight/2 - bottomWidth+3, hangerPocketDepth/2 -.1])
        cube([hangerPocketWidth, hangerPocketHeight, hangerPocketDepth], center = true);
            
        // side hanger box
        translate([bottomFrameX + hangerPocketHeight/2 - bottomWidth - 5.1, -bottomFrameY/2, hangerPocketDepth/2 -.1])
        cube([hangerPocketHeight, hangerPocketWidth, hangerPocketDepth], center = true);
        
        translate([bottomFrameX + hangerPocketHeight/2 - bottomWidth+3, -bottomFrameY/2, hangerPocketDepth/2 -.1])
        cube([hangerPocketHeight, hangerPocketWidth, hangerPocketDepth], center = true);
        
        // topClip pocket
        translate([bottomFrameX/4, pocketHeight/2 - bottomWidth - .1, -.1])
        linear_extrude(height = 7)
        import(clipPocket, center = true);
        
        // leftClip pocket
        translate([pocketHeight/2 - bottomWidth - .1, -frameX/4, -.1])
        translate([bottomFrameX, 0, 0])
        linear_extrude(height = 7)
        rotate([0, 0, -90])
        import(clipPocket, center = true);
        
        // rightClip pocket
        translate([-pocketHeight/2 + bottomWidth +.1, bottomFrameX/4, -.1])
        translate([0, -bottomFrameY, 0])
        linear_extrude(height = 7)
        rotate([0, 0, 90])
        import(clipPocket, center = true);
        
        // bottomClip pocket
        translate([-bottomFrameX/4, -pocketHeight/2 + bottomWidth + .1, -.1])
        translate([bottomFrameX, -bottomFrameY, 0])
        linear_extrude(height = 7)
        rotate([0, 180, -180])
        import(clipPocket, center = true);
        
        // Actual screws 
        translate([0, 0, 3])
        rectangleScrews(bottomFrameX, bottomFrameY, bottomWidth/2, diam4, p4, length4);
        
        // Holes to lay flush on wall
        translate([bottomWidth/2, -bottomWidth/2, 0])
        cylinder(h = 6, r = diam4, center = true);
        translate([bottomFrameX - bottomWidth/2, -bottomWidth/2, 0])
        cylinder(h = 6, r = diam4, center = true);
        
        translate([bottomFrameX - bottomWidth/2, -bottomFrameY + bottomWidth/2, 0])
        cylinder(h = 6, r = diam4, center = true);
        
        translate([bottomWidth/2, -bottomFrameY + bottomWidth/2, 0])
        cylinder(h = 6, r = diam4, center = true);
    }


    // top hanger
    translate([bottomFrameX/2, -hangerHeight/2 - (bottomWidth-hangerPocketHeight)-5, 0])
    linear_extrude(height = hangerDepth)
    import(hanger, center = true);

    // side hanger
    translate([bottomFrameX -hangerHeight/2 - (bottomWidth-hangerPocketHeight) - 5, -bottomFrameY/2, 0])
    linear_extrude(height = hangerDepth)
    rotate([0, 0, -90])
    import(hanger, center = true);

    // top bendy clip
    linear_extrude(height = clipDepth)
    translate([bottomFrameX/4+pocketWidth/4, -clipHeight/2 - (bottomWidth - pocketHeight), 0])
    rotate([0, 180, 0])
    import(clip, center = true);

    // left bendy clip
    linear_extrude(height = clipDepth)
    translate([-clipHeight/2 - (bottomWidth - pocketHeight), -bottomFrameX/4-pocketWidth/4, 0])
    translate([bottomFrameX, 0, 0])
    rotate([0, 180, -90])
    import(clip, center = true);

    // right bendy clip
    linear_extrude(height = clipDepth)
    translate([clipHeight/2 + (bottomWidth - pocketHeight), bottomFrameX/4+pocketWidth/4, 0])
    translate([0, -bottomFrameY, 0])
    rotate([0, 180, 90])
    import(clip, center = true);

    // bottom bendy clip
    linear_extrude(height = clipDepth)
    translate([-bottomFrameX/4-pocketWidth/4, clipHeight/2 + (bottomWidth - pocketHeight), 0])
    translate([bottomFrameX, -bottomFrameY, 0])
    rotate([0, 180, -180])
    import(clip, center = true);
}