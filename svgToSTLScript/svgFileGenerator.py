import sys

# Argument format : [svgWidth, svgHeight, fileText, fileName]
arguments = sys.argv

with open(arguments[4]+".svg", "w") as f:
    f.write(arguments[3])
