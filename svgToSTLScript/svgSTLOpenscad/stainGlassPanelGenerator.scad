/*
This script provides modules for generating stain glass panels with 
varying dimensions/properties. SVG files of 
the inner design profile as well as the panel dimensions are 
necessary.
*/

include <frameGenerator.scad>;

// innerRailDims and outerRailDims => [width, height] (done with cap)
module stainGlassPanelold(panelDims, innerDesignSVG, outerRailProfile, innerRailDims, outerRailDims, innerWellDims, outerWellDims, capsOn) {
    
    
    // Getting the dimensions of the wells (inner and outer)
    outerWellWidth = outerWellDims[0];
    outerWellHeight = outerWellDims[1];
    nonWellOuterHeight = outerRailDims[1] - outerWellHeight;
    
    innerWellWidth = innerWellDims[0];
    innerWellHeight = innerWellDims[1];
    nonWellInnerHeight = innerRailDims[1] - innerWellHeight;
    
    // Getting the dimensions of the inner rail and outer rail
    outerWidth = outerRailDims[0];
    outerHeight = capsOn ? outerRailDims[1] : outerRailDims[1] - nonWellOuterHeight/2;
    
    innerWidth = innerRailDims[0];
    innerHeight = capsOn ? innerRailDims[1] : innerRailDims[1] - nonWellInnerHeight/2;
    
    xOuter = panelDims[0];
    yOuter = panelDims[1];
    
    // Extruding the outer frame rails
    frameSVG(xOuter, yOuter, outerRailProfile, outerWidth, outerHeight);
    
    // Code for creating rounded top
//    for(i = [0:100]) {
//        translate([0, 0, .1*i])
//        linear_extrude(height = .1) {
//            offset(r=-.03*i)
//            import(innerDesignSVG, center = true);
//        }
//    }
    
    /***** Extruding the inner design *****/
    // Moving inner design to same spot as outer rails
    translate([xOuter/2, -yOuter/2, 0]) {
        // Placing the bottom layer for inner design
        linear_extrude(height = nonWellInnerHeight/2) {
            import(innerDesignSVG, center = true);
        }
        
        // Placing the middle (well) layer for inner design
        translate([0, 0, nonWellInnerHeight/2]) {
            linear_extrude(height = innerWellHeight) {
                offset(r = -innerWellWidth) {
                    import(innerDesignSVG, center = true);
                }
            }
        }
        
        // Placing the top layer for inner design (if capsOn)
        if(capsOn) {
            translate([0, 0, innerHeight - nonWellInnerHeight/2]) {
                linear_extrude(height = nonWellInnerHeight/2) {
                    import(innerDesignSVG, center = true);
                }
            }
        }
    }
    
}

// Module for adding a bowtie connector with the center at xLoc, yLoc
module bowtieConnector(xLocation, yLocation, topBottom=false) {
    linear_extrude(height = 10)
    translate([xLocation, -yLocation, 0])
    rotate([0, 0, topBottom ? 90 : 0])
    translate([-3, 5, 0])
    polygon([[0, 0], [3, -4], [6, 0], [6, -10], [3, -6], [0, -10]]);
}

// Module for innersvg design
module innerPanel(innerDesignSVG, scaleNum, panelDims, offsetNum) {
    // Placing the bottom layer for inner design
    linear_extrude(height = 3) {
        // Scaling and differencing for changing dims
        offset(delta=-offsetNum) {
            scale([scaleNum, scaleNum, 1]) {
                import(innerDesignSVG, center = true);
                
            }
        }
    }
    
    // Placing the middle (well) layer for inner design
    translate([0, 0, 3]) {
        linear_extrude(height = 3) {
            offset(r = -2) {
                // Scaling and differencing for changing dims
                offset(delta=-offsetNum) {
                    scale([scaleNum, scaleNum, 1]) {
                        import(innerDesignSVG, center = true);
                    }
                }
            }
        }
    }
    
    // Placing the middle bottom notch for inner design
    translate([0, 0, 3+3]) {
        linear_extrude(height = .2) {
            offset(r = -1.8) {
                // Scaling and differencing for changing dims
                offset(delta=-offsetNum) {
                    scale([scaleNum, scaleNum, 1]) {
                        import(innerDesignSVG, center = true);
                    }
                }
            }
        }
    }
    
    // Placing the middle bottom cap top for inner design
    translate([0, 0, 3+3+.2]) {
        linear_extrude(height = 2.8) {
            // Scaling and differencing for changing dims
            offset(delta=-offsetNum) {
                scale([scaleNum, scaleNum, 1]) {
                    import(innerDesignSVG, center = true);
                }
            }
        }
    }
    
    // Placing the bottom of the cap layer for inner design
    for(i = [1:4]) {
        translate([0, 0, 3+3+.2+2.8+(i-1)*.2]) {
            linear_extrude(height = .2) {
                offset(r = -(i*.2)) {
                    // Scaling and differencing for changing dims
                    offset(delta=-offsetNum) {
                        scale([scaleNum, scaleNum, 1]) {
                            import(innerDesignSVG, center = true);
                        }
                    }
                }
            }
        }
    }
    
//    // Placing the middle of the cap layer for inner design
//    translate([0, 0, 3+3+.4]) {
//        linear_extrude(height = 2) {
//             
//            // Scaling and differencing for changing dims
//            offset(delta=-offsetNum) {
//                scale([scaleNum, scaleNum, 1]) {
//                    import(innerDesignSVG, center = true);
//                }
//            }
//            
//        }
//    }
//    
//    // Placing the top of the cap layer for inner design
//    for(i = [0:2]) {
//        translate([0, 0, 3+3+.4+2+(i*.2)]) {
//            linear_extrude(height = .2) {
//                offset(r = -(.8)*(i+1)) {
//                    // Scaling and differencing for changing dims
//                    offset(delta=-offsetNum) {
//                        scale([scaleNum, scaleNum, 1]) {
//                            import(innerDesignSVG, center = true);
//                        }
//                    }
//                }
//            }
//        }
//    }
    
//    // Placing the very top of the cap layer for inner design
//    translate([0, 0, 3+3.199+1.2+2.401+1]) {
//        linear_extrude(height = .2) {
//            offset(r = -3) {
//                // Scaling and differencing for changing dims
//                offset(delta=-offsetNum) {
//                    scale([scaleNum, scaleNum, 1]) {
//                        import(innerDesignSVG, center = true);
//                    }
//                }
//            }
//        }
//    }
}

// Module for inner svg design with different x,y scales
module innerPanelScale(innerDesignSVG, scaleNums) {
    // Placing the bottom layer for inner design
    linear_extrude(height = 3) {
        // Scaling and differencing for changing dims
        minkowski() {
            scale([scaleNums[0], scaleNums[1], 1]) {
                offset(delta=-3.84)
                import(innerDesignSVG, center = true);
            }
            square([8, 8], center=true);
        }
    }
    
    // Placing the middle (well) layer for inner design
    translate([0, 0, 3]) {
        linear_extrude(height = 3.199) {
            offset(r = -3) {
                // Scaling and differencing for changing dims
                minkowski() {
                    scale([scaleNums[0], scaleNums[1], 1]) {
                        offset(delta=-3.84)
                        import(innerDesignSVG, center = true);
                    }
                    square([8, 8], center=true);
                }
            }
        }
    }
    
    // Placing the bottom of the cap layer for inner design
    for(i = [0:5]) {
        translate([0, 0, 3+3.199+(i*.2)]) {
            linear_extrude(height = .2) {
                offset(r = -3 + ((i+1)*.4)) {
                    // Scaling and differencing for changing dims
                    minkowski() {
                        scale([scaleNums[0], scaleNums[1], 1]) {
                            offset(delta=-3.84)
                            import(innerDesignSVG, center = true); 
                        }
                        square([8, 8], center=true);
                    }
                }
            }
        }
    }
    
    // Placing the middle of the cap layer for inner design
    translate([0, 0, 3+3.199+1.2]) {
        linear_extrude(height = 2.401) {
            offset(r = -(.4)) {
                // Scaling and differencing for changing dims
                minkowski() {
                    scale([scaleNums[0], scaleNums[1], 1]) {
                        offset(delta=-3.84)
                        import(innerDesignSVG, center = true);
                    }
                    square([8, 8], center=true);
                }
            }
        }
    }
    
    // Placing the top of the cap layer for inner design
    for(i = [0:4]) {
        translate([0, 0, 3+3.199+1.2+2.401+(i*.2)]) {
            linear_extrude(height = .2) {
                offset(r = -(.4)*(i+2)) {
                    // Scaling and differencing for changing dims
                    minkowski() {
                        scale([scaleNums[0], scaleNums[1], 1]) {
                            offset(delta=-3.84)
                            import(innerDesignSVG, center = true);
                        }
                        square([8, 8], center=true);
                    }
                }
            }
        }
    }
    
    // Placing the very top of the cap layer for inner design
    translate([0, 0, 3+3.199+1.2+2.401+1]) {
        linear_extrude(height = .2) {
            offset(r = -3) {
                // Scaling and minkowski for changing dims
                minkowski() {
                    scale([scaleNums[0], scaleNums[1], 1]) {
                        offset(delta=-3.84)
                        import(innerDesignSVG, center = true);
                    }
                    square([8, 8], center=true);
                }
            }
        }
    }
}


// innerRailDims and outerRailDims => [width, height] (done with cap)
module stainGlassPanel(panelDims, innerDesignSVG, outerRailProfile, outerRailDims, userScales=[1, 1]) {
    
    // Code for creating rounded top
//    for(i = [0:100]) {
//        translate([0, 0, .1*i])
//        linear_extrude(height = .1) {
//            offset(r=-.03*i)
//            import(innerDesignSVG, center = true);
//        }
//    }
    
    // Getting the scaleNum from the userScale / offsetNum from scaleNum
    scaleNum = (userScales[0]*panelDims[0] - 8) / (panelDims[0] - 8);
    scaleNums = [(userScales[0]*panelDims[0] - 7.68) / (panelDims[0] - 7.68+.32), 
    (userScales[1]*panelDims[1] - 7.68) / (panelDims[1] - 7.68+.32)];
    offsetNum = 4*(scaleNum-1);
    
    // New panel dims with user scale applied
    scaledPanelDims = [panelDims[0]*userScales[0], panelDims[1]*userScales[1]];
    xOuter = scaledPanelDims[0];
    yOuter = scaledPanelDims[1];
    
    outerWidth = outerRailDims[0];
    outerHeight = outerRailDims[1];
    
    // Extruding the outer frame rails
    difference() {
        union() {
            frameSVG(xOuter, yOuter, outerRailProfile, outerWidth, outerHeight);
            translate([xOuter/2, -yOuter/2, 0]) {
                innerPanel(innerDesignSVG, scaleNum, panelDims, offsetNum);
            }
        }
//        // Top and bottom connectors
//        bowtieConnector(panelDims[0]/3, 0, true);
//        bowtieConnector(2*panelDims[0]/3, 0, true);
//        bowtieConnector(panelDims[0]/3, panelDims[1], true);
//        bowtieConnector(2*panelDims[0]/3, panelDims[1], true);
//        
//        // Side connectors
//        bowtieConnector(0, panelDims[1]/3);
//        bowtieConnector(0, 2*panelDims[1]/3);
//        bowtieConnector(panelDims[0], panelDims[1]/3);
//        bowtieConnector(panelDims[0], 2*panelDims[1]/3);
    }
//    /***** Extruding the inner design using static cap *****/
//    // Moving inner design to same spot as outer rails
//    if(userScales[0] == userScales[1]) {
//        translate([xOuter/2, -yOuter/2, 0]) {
//            innerPanel(innerDesignSVG, scaleNum, panelDims, offsetNum);
//        }
//    }
//    else {
//        translate([xOuter/2, -yOuter/2, 0]) {
//            innerPanelScale(innerDesignSVG, scaleNums);
//        }
//    }
    
}




// lineart panel generation with full list of files necessary
module stainGlassPanelLineart(panelDims, fullWidthSVG, wellWidthSVG, topSVGs, numberRotations) {
    // Base of the panel
    linear_extrude(height = 2) {
        offset(delta=0.0001)
        import(fullWidthSVG, center=true);
    }
    
    // Well of the panel
    translate([0, 0, 2]) {
        linear_extrude(height = 3.2) {
            offset(delta=0.0001)
            import(wellWidthSVG, center=true);
        }
    }
    
    // Top of well of the panel
    translate([0, 0, 5.2]) {
        linear_extrude(height = 1.6) {
            offset(delta=0.0001) 
            import(fullWidthSVG, center=true);
        }
    }
    
    // Looping through to add the top caps
    for(i = [0 : len(topSVGs)-1]) {
        translate([0, 0, 6.8 + (i*.4)]) {
            linear_extrude(height = .4) {
                offset(delta=0.0001)
                import(topSVGs[i], center=true);
            }
        }
    }
    
    rotatedPanelDims = numberRotations % 2 == 0 ? [panelDims[0]/2, panelDims[1]/2] : [panelDims[1]/2, panelDims[0]/2];
    
    
    // Adding brim to the panel
    difference() {
        difference() {
            translate([0, 0, .4]) 
            cube([2*rotatedPanelDims[0]+10, 2*rotatedPanelDims[1]+10, .8], center=true);
            translate([0, 0, .4])
            cube([2*rotatedPanelDims[0], 2*rotatedPanelDims[1], .8], center=true);
        }
        
            // Thin brim cut
            translate([0, 0, .4+.2]) {
                cube([2*rotatedPanelDims[0]+.8, 2*rotatedPanelDims[1]+.8, .4], center=true);
            }
            
            // Top right brim corner
            translate([rotatedPanelDims[0]+2.5, rotatedPanelDims[1]+2.5, .4]) {
                cube([5, 5, .8], center=true);
            }
            // Top left brim corner
            translate([-rotatedPanelDims[0]-2.5, rotatedPanelDims[1]+2.5, .4]) {
                cube([5, 5, .8], center=true);
            }
            // Bottom right brim corner
            translate([rotatedPanelDims[0]+2.5, -rotatedPanelDims[1]-2.5, .4]) {
                cube([5, 5, .8], center=true);
            }
            // Bottom left brim corner
            translate([-rotatedPanelDims[0]-2.5, -rotatedPanelDims[1]-2.5, .4]) {
                cube([5, 5, .8], center=true);
            }
    }
    
}