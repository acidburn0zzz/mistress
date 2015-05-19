"use strict";
var path = require("path");
var datapool = require(path.join(__dirname,"datapool.js"));
var twitwrap = require(path.join(__dirname,"twitwrap.js"));

var pool = new datapool();
var twee = new twitwrap(pool.auth("botmistress"));

//console.log(pool.id("alicemazzy"), pool.id("63506279"), pool.id("me"));
//console.log(pool.id("botmistress"), pool.id("3168258306"), pool.id("you"));

//twee.status({id: "600471331315052545"}, (err,data) => console.log(err,data.user.screen_name));

twee.reply({status: "just making sure the new t method sig works", reply_id: "600471331315052545"}, err => {if(err) throw err});

/*
//console.log(JSON.stringify(hi,null,"\t"));
console.log(JSON.stringify(hi.auth("alicemazzy")));
var myfunc = function(one) {
console.log(JSON.stringify(arguments));
}

myfunc(1, 2, 3);*/
