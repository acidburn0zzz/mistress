var lzw = require("node-lzw");

var input = process.argv[2];
var output = lzw.encode(process.argv[2]);

console.log("input: " + input +
	    "\noutput: " + output +
	    "\ninput length: " + input.length +
	    "\noutput length: " + output.length);
