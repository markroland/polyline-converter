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

// Parse file
var parser = parse({cast: true}, function (err, points) {

  if (argv._[1] == "thr") {

    let TR = new ThetaRho();
    let thr = TR.convert(points, 0.01);
    console.log(thr);

  } else {
    console.log('Output Format required. Please specify one of the following as the second argument: thr');
  }

});

// Read CSV file
if (fs.existsSync(input_filepath)) {
  fs.createReadStream(input_filepath).pipe(parser);
} else {
  console.log('File does not exist.');
}
