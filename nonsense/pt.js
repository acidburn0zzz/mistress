var lzw = require("node-lzw");

var input = process.argv[2];
var output = lzw.encode(process.argv[2]).split("").map(function(it){return String.fromCharCode(it.charCodeAt()+1)}).join("");
var roundtrip = lzw.decode(output.split("").map(function(it){return String.fromCharCode(it.charCodeAt()-1)}).join(""));

console.log("input: " + input +
	    "\noutput: " + output +
	    "\nroundtrip: " + roundtrip +
	    "\ninput length: " + input.length +
	    "\noutput length: " + output.length +
	    "\nroundtrip length: " + roundtrip.length
	   );
