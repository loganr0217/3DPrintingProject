ORDERID = 0
ACTUALINDEX = 0

FILES: STLS PANES

STLS: 
	-@mkdir order_$(ORDERID)
	-@tsc svgScaler.ts
	-@node svgScaler.js -STLS $(ACTUALINDEX)
	-@for %%f in (*.scad) do "C:\Program Files\OpenSCAD\openscad.exe" -o "%%f.stl" "%%f"
	-@mkdir order_$(ORDERID)\STLS
	-@move *.stl "order_$(ORDERID)\STLS"
	-@del *.svg *.scad svgScaler.js

PANES:
	-@tsc svgScaler.ts
	-@node svgScaler.js -PANES $(ACTUALINDEX)
	-@mkdir order_$(ORDERID)\PANES
	-@move *.svg "order_$(ORDERID)\PANES"
	-@del svgScaler.js