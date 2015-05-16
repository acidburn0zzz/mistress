//bullshit file I used to one-time convert thralls.json
//keep the code for copy-pasting tho
"use strict";

var fs = require("fs");
//var twit = require("twit");
var _ = require("underscore");

var obj = JSON.parse(fs.readFileSync(__dirname + "/thralls.json", "utf8"));
var int_keys = _.filter(_.keys(obj), function(element) { return !isNaN(element); });

var yay = {};
int_keys.forEach(element => yay[element]= obj[element] );

fs.writeFile("thralls.json", JSON.stringify(yay,null,"\t"), function(){});
