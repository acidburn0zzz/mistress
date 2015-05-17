"use strict";
var pool = require("./datapool.js");

var hi = new pool();

//console.log(JSON.stringify(hi,null,"\t"));
console.log(JSON.stringify(hi.auth("alicemazzy")));
