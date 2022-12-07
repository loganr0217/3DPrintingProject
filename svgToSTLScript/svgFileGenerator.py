import sys
import os

# Argument format : [svgWidth, svgHeight, fileText, fileName] --> fileText is now in dummyFile.txt
arguments = sys.argv

with open(arguments[3]+".txt") as f:
    lines = f.read()
os.remove(arguments[3]+".txt")

with open(arguments[3]+".svg", "w") as f:
    f.write(lines)
