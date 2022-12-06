from solid import *
from solid.utils import *
import sys

# Argument format : [svgWidth, svgHeight, fileNameStarter]
arguments = sys.argv

if arguments[3].find("panelFile") != -1:
    frameGenerator = import_scad("./svgSTLOpenscad/frameGenerator.scad")
    stainGlassPanelGenerator = import_scad("./svgSTLOpenscad/stainGlassPanelGenerator.scad")
    screwGenerator = import_scad("./svgSTLOpenscad/screwGenerator.scad")


    test = stainGlassPanelGenerator.stainGlassPanelLineart([float(arguments[1]), float(arguments[2])], '../'+arguments[3]+"_fullWidth.svg", '../'+arguments[3]+"_wellWidth.svg", ['../'+arguments[3]+"_topPiece0.svg", '../'+arguments[3]+"_topPiece1.svg", '../'+arguments[3]+"_topPiece2.svg", '../'+arguments[3]+"_topPiece3.svg"], int(arguments[4]))
    scad_render_to_file(test, arguments[3]+'.scad')