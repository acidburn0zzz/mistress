"use strict";

const fs = require("fs");
const path = require("path");
const _ = require("underscore");
const twee = require(path.join(__dirname,"lib","twitwrap.js"));

//fancier logic goes here
const executor = require(path.join(__dirname,"lib",process.argv[2] ? "cli.js" : "stream.js"))

const accounts = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "thralls.json"), "utf8"));

//two very special objects
const insect = _.extend(new twee(accounts["63506279"].credentials),{
	id_str: "63506279",
	screen_name: "alicemazzy",
	name: "Alice Maz",
	alias: ["Alice","alice","insect","me","my","myself"]
});

const mistress = _.extend(new twee(accounts["3168258306"].credentials), {
	id_str: "3168258306",
	screen_name: "botmistress",
	name: "mistress@vesta:~#",
	sleepName: "mistress@vesta:~$",
	alias: ["Mistress","mistress","you","your","yourself","yrself","self"],
	execute: executor
});

//however many boring objects
const thralls = _.chain(accounts)
	.omit("63506279","3168258306")
	.mapObject(val => new twee(val.credentials))
	.value();

mistress.execute();


//mistress.pulldown({screen_name: "swayandsea"}).then(data => fs.writeFile("ml/training/suit.json",JSON.stringify(data,null,"\t"),"utf8", err=>{}));
