/*
This script provides modules for generating screws for picture frames
with varying dimensions/properties. 
Tips/Requirements:
- screw holes need to be 1mm larger than actual screw (4mm -> 5mm)
- make the distanceIn value dependent upon the bottomDesignWidth
- - Ex: I used bottomWidth/6 for frame2.svg
*/

// Module to create single screw given screw properties
module screw(diameter, pitch, length) {
    // Builds a screw with the given dimensions
    // make sure to use 1 mm diameter more than the screw
    // Ex: for an M4, use diameter of 5mm
    
    // Number of threads for this screw
    numLines = length / pitch;
    
    // Placing screw so it starts at origin and goes up
    translate([0, 0, -length/2]) {
        // Threads of screw
        difference() {
            linear_extrude(height = 2*length, twist = 360*2*numLines, $fn = 10)
            translate([diameter/4, 0, 0])
            circle((diameter/4), $fn = 10);
            
            translate([0, 0, length*2]) {
                cube([diameter*2, diameter*2, length], center = true);
            }
            cube([diameter*2, diameter*2, length], center = true);
        }
        // Core of screw
        difference() {
            linear_extrude(height = 2*length) {
                circle((diameter*.8)/2, $fn = 100);
            }
            
            translate([0, 0, length*2]) {
                cube([diameter*2, diameter*2, length], center = true);
            }
            cube([diameter*2, diameter*2, length], center = true);
        }
    }
}

// Module to create screws for a rectangular frame
module rectangleScrews(xDimBottom, yDimBottom, distanceIn, screwDiam, screwPitch, screwLength) {
    // Uses frame dimensions and screw properties to place screws
    // symmetrically across frame
    
    // Bottom right screw (base everything off this
    translate([distanceIn, -distanceIn, -0.05]) {
        screw(screwDiam, screwPitch, screwLength);
    }
    // Top right
    translate([distanceIn, distanceIn - yDimBottom, -0.05]) {
        screw(screwDiam, screwPitch, screwLength);
    }
    // Bottom left
    translate([xDimBottom - distanceIn, -distanceIn, -0.05]) {
        screw(screwDiam, screwPitch, screwLength);
    }
    // Top left
    translate([xDimBottom - distanceIn, distanceIn - yDimBottom, -0.05]) {
        screw(screwDiam, screwPitch, screwLength);
    }
}
