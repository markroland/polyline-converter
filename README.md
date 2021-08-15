# Polyline Converter

Convert a polyline (a series of points) from one format to another.

This initial version converts a CSV file of rectangular (Cartesian) coordinates
to the polar "Theta-Rho" notation used by (Sisyphus Tables)[https://sisyphus-industries.com].

In future versions I plan to offer:
- Theta-Rho to rectangular conversion in CSV, JSON and G-code formats.
- G-Code to Theta-Rho

I may also support rectangular reformatting for CSV to JSON and vice versa.

## Important Note about Rectangular to Theta-Rho Conversion

When converting from the x/y position of rectangular coordinates to the
angle/radius position of polar/Theta-Rho coordinates it is important to remember
that a straight line between two rectangular points will not be a straight line
in polar coordinates. In order to build a straight line in THR coordinates, the
rectangular coordinates must first be subdivided into smaller line segments to
minimize the arcing effect of THR point-to-point segments. This is handled in
this code by passing a second "max_segment_length" parameter to ThetaRho.convert().

## Installation

```
npm install @markroland/polyline-converter
```

## Command Line Usage

```
node ./index.js [input filepath] thr > output.thr
```

Tip, if `npm link` has been used you can use: 

```
convert-polyline [input filepath] thr > output.thr
```

## License

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.
