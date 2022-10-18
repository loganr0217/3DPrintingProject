from solid import *
from solid.utils import *
import sys

# Argument format : [fileName, svgWidth, svgHeight, svgFileText]
arguments = sys.argv

with open(arguments[4]+".svg", "w") as f:
    f.write(arguments[3])

if arguments[4].find("panelFile") != -1:
    frameGenerator = import_scad("./svgSTLOpenscad/frameGenerator.scad")
    stainGlassPanelGenerator = import_scad("./svgSTLOpenscad/stainGlassPanelGenerator.scad")
    screwGenerator = import_scad("./svgSTLOpenscad/screwGenerator.scad")

    test = stainGlassPanelGenerator.stainGlassPanel([float(arguments[1]), float(arguments[2])], '../'+arguments[4]+".svg",'railProfileBorder3.svg', [5, 9.8])
    scad_render_to_file(test, arguments[4]+'.scad')