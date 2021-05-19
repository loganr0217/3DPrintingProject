include <frameGenerator.scad>;
// Function parameters: 
// frame(xDim, yDim, polygonPoints, polygonHeight designWidth, designHeight);
// frameSVG(xDim, yDim, fileName, designWidth, designHeight);
// weirdFrameSVG(sideLength, numSides, fileName, designWidth, designHeight

frameXTop = 172;
frameYTop = 222;

frameXBottom = 166;
frameYBottom = 216;

frame2Top = "frame2Top.svg";
frame2Bottom = "frame2Bottom.svg";

//import(frame2Top, center = true);
//import(frame2Bottom, center = true);

topWidth = 30;
topHeight = 9;

bottomWidth = 18;
bottomHeight = 9;

// Top design
//frameSVG(frameXTop, frameYTop, frame2Top, topWidth, topHeight);

// Bottom design
//frameSVG(frameXBottom, frameYBottom, frame2Bottom, bottomWidth, bottomHeight);

// Weird frame top design
weirdFrameSVG(200, 6, frame2Top, topWidth, topHeight);

// Weird frame bottom design
//weirdFrameSVG(5, 100, frame2Bottom, bottomWidth, bottomHeight);


