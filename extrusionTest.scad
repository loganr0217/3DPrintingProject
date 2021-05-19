/*
©️, 2021, Logan Richards
This script is used for creating the picture frame STL files using
the frameGenerator (and screwGenerator) with the corresponding frame
rail profile, given as an SVG, and its dimensions.
*/

include <frameGenerator.scad>;
include <screwGenerator.scad>;
/* frameGenerator function parameters: 
frame(xDim, yDim, polygonPoints, polygonHeight designWidth, designHeight);
frameSVG(xDim, yDim, fileName, designWidth, designHeight);
weirdFrameSVG(sideLength, numSides, fileName, designWidth, designHeight);
*/
/* screwGenerator function parameters:
screw(diameter, pitch, length);
rectangleScrews(xDimBottom, yDimBottom, distanceIn, screwDiam, screwPitch, screwLength);
*/

// Top frame dimensions
frameXTop = 172;
frameYTop = 222;

// Bottom frame dimensions
frameXBottom = 166;
frameYBottom = 216;

// SVG file paths
frame2Top = "frame2Top.svg";
frame2Bottom = "frame2Bottom.svg";

//import(frame2Top, center = true);
//import(frame2Bottom, center = true);

// Top design dimensions
topWidth = 30;
topHeight = 9;

// Bottom design dimensions
bottomWidth = 18;
bottomHeight = 9;

// Screw info: needs to be 1mm larger actual screw (4mm->5mm)
diam4 = 5;
p4 = .70;
length4 = 12;


// For STL file generation with screws do one of the designs 
// at a time by commenting out the other
difference() {
    // Bottom design
    frameSVG(frameXBottom, frameYBottom, frame2Bottom, bottomWidth, bottomHeight);
    
//    // Top design
//    translate([-(topWidth - bottomWidth)/4, (topWidth - bottomWidth)/4, topHeight]) {
//        frameSVG(frameXTop, frameYTop, frame2Top, topWidth, topHeight);
//    }
    
    // Creating screws to drill
    rectangleScrews(frameXBottom, frameYBottom, bottomWidth/6, diam4, p4, length4);
}


/*********** Odd shaped frames are below *************/
// Weird frame top design
//weirdFrameSVG(200, 6, frame2Top, topWidth, topHeight);

// Weird frame bottom design
//weirdFrameSVG(5, 100, frame2Bottom, bottomWidth, bottomHeight);


