"use strict";
var path = require("path");
var datapool = require(path.join(__dirname,"datapool.js"));
var twitwrap = require(path.join(__dirname,"twitwrap.js"));

var pool = new datapool();
var twee = new twitwrap(pool.auth("botmistress"));

twee.t("This is the second test of the new @botmistress modules", err => {if(err) throw err});
twee.t(pool.auth("alicemazzy"), "And this is the third test", err => {if(err) throw err});


/*
//console.log(JSON.stringify(hi,null,"\t"));
console.log(JSON.stringify(hi.auth("alicemazzy")));
var myfunc = function(one) {
console.log(JSON.stringify(arguments));
}

myfunc(1, 2, 3);*/
