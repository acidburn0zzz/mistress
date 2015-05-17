//wrapper for common twit things I do and the config files of this project
//the idea is... hm actually should I split the creation of twit objects from the actual tweeting code?
//back the fuck up what is this even doing, I have no design strat atm
//first load all the twitter accounts up
//once that is done GET deets for bot & me from the bot's twit object
//build data structures (the two from map, uhh forgot what else)
//post bot name from $ to #
"use strict";

//temp
const botId = 63506279;
const 

var fs = require("fs");
var twit = require("twit");
var _ = require("underscore");
var path = require("path");

var thrallsP = new Promise((resolve, reject) => fs.readFile(path.join(__dirname, "..", "data", "thralls.json"), "utf8", (err, data) => {
	err ? reject(err) : resolve(JSON.parse(data));
}));



Promise.all([thrallsP]).then(data => console.log("yay this works"));
//thrallsP.then(data => console.log("everything went better than expected\n",JSON.stringify(data)),
//	      err => console.log("Init Error\n", err));
/*

//load up and build our data
var accounts = JSON.parse(fs.readFileSync(__dirname + "/thralls.json", "utf8"));

//twit objects for all accounts
const t = _.mapObject(accounts, val => new twit(val.credentials));
//lookup table of id:screen_name k:vs
const lookup = _.mapObject(accounts, val => val.screen_name);
//fuck it think of a better way to implement this later
*/
