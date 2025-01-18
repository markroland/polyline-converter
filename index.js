#!/usr/bin/env node

// Parse input arguments
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;

// Requirements
var fs = require('fs');
var parse = require('csv-parse');
// var stringify = require('csv-stringify');
const ThetaRho = require('./src/ThetaRho.js');

// Read input filepath
let input_filepath = null;
if (argv.file) {
  input_filepath = argv.file;
} else if (argv._[0]) {
  input_filepath = argv._[0];
} else {
  console.log('Input File required. Please specify the file path as the first argument');
  process.exit();
}

let path = [];

// TODO: Determine file type using regex or file suffic (.thr, .gcode, .csv)
// const thr_regex = new RegExp("\d*\.?\d*\s+\d*\.?\d*");
// const rect_regex = new RegExp("\d*\.?\d*(\s*,\s*)\d*\.?\d*");
// const gcode_regex = new RegExp("G0\s+X\d*\.?\d*\sY\d*\.?\d*");

const drawing_area_width = 472;
const drawing_area_height = 380;

// Parse file
var parser = parse(
  {
    comment: "#"
  },
  function (err, points) {

    if (argv._[1] == "thr") {

      let TR = new ThetaRho();
      let thr = TR.convert(points, 0.01);
      console.log(thr);

    } else if (argv._[1] == "rect") {

      // Split line using space as the delimeter
      for (let point of points) {
        let p = point[0].split(' ');
        path.push([
          parseFloat(p[0]),
          parseFloat(p[1])
        ]);
      }

      // Convert from Theta-Rho to rectangular
      let TR = new ThetaRho();
      let rectangular = TR.toRectangular(path, drawing_area_width, drawing_area_height);

      // Convert to comma-separated format
      for (let point of rectangular) {
        console.log(point[0].toFixed(1) + "," + point[1].toFixed(1));
      }

    } else if (argv._[1] == "gcode") {

      // Split line using space as the delimeter
      for (let point of points) {
        let p = point[0].split(' ');
        path.push([
          parseFloat(p[0]),
          parseFloat(p[1])
        ]);
      }

      // Convert from Theta-Rho to Gcode
      let TR = new ThetaRho();
      let gcode = TR.toGcode(path, drawing_area_width, drawing_area_height);

      // Convert to comma-separated format
      for (let point of gcode) {
        console.log("G0 X" + point[0].toFixed(1) + " Y" + point[1].toFixed(1));
      }

    } else {
      console.log('Output Format required. Please specify one of the following as the second argument: thr');
    }
  }
);

// Read CSV file
if (fs.existsSync(input_filepath)) {
  fs.createReadStream(input_filepath).pipe(parser);
} else {
  console.log('File does not exist.');
}
