//immutable data to be shared by the other pieces of the program
//back the fuck up what is this even doing, I have no design strat atm
//first load all the twitter accounts up
//once that is done GET deets for bot & me from the bot's twit object
//build data structures (the two from map, uhh forgot what else)
//post bot name from $ to #

//--
"use strict";

const fs = require("fs");
const path = require("path");
const twit = require("twit");
const _ = require("underscore");
//--

//load up all the api data
//no point doing it async as everything depends on this anyway
const accounts = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "thralls.json"), "utf8"));

var Datapool = function() {
	//no real reason to put this in a config file? idk
	//mixing var_style and varStyle is to conform to Twitter api only where relevant
	this.insect = {
		id_str: "63506279",
		screen_name: "alicemazzy",
		name: "Alice Maz",
		alias: ["Alice","me","my","myself"]
	};
	this.mistress = {
		id_str: "3168258306",
		screen_name: "botmistress",
		name: "mistress@vesta:~#",
		sleepName: "mistress@vesta:~$",
		alias: ["Mistress","you","your","yourself","yrself","self"]
	};
	//twit objects for all accounts
	this.twitters = _.mapObject(accounts, val => new twit(val.credentials));
	//lookup table of k:v ==  id:screen_name
	this.lookup = _.mapObject(accounts, val => val.screen_name);

	//I'd like this to console.log stuff saying what bots are loaded, no errors, etc
	//think abt actor model... can there be like a "logger" actor that any module can pass to?
}

Datapool.prototype = {
	//returns id given id, screen_name, or alias
	id: who => {
		return _.has(this.lookup, who) ? who : (
			_.invert(this.lookup)[who] || (
			_.contains(this.mistress.alias, who) ?
			this.mistress.id_str :
			_.contains(this.insect.alias, who) ?
			this.insect.id_str :
			undefined
		));
	},
	//returns usable twit obj given same
	auth: who => {
		return this.twitters[this.id(who)];
	}
}

module.exports = Datapool;

		

//Promise.all([thrallsP]).then(data => console.log("yay this works"));
//thrallsP.then(data => console.log("everything went better than expected\n",JSON.stringify(data)),
//	      err => console.log("Init Error\n", err));
/*

const thrallsP = new Promise((resolve, reject) => fs.readFile(path.join(__dirname, "..", "data", "thralls.json"), "utf8", (err, data) => {
	err ? reject(err) : resolve(JSON.parse(data));
}));
//load up and build our data

//twit objects for all accounts
const t = _.mapObject(accounts, val => new twit(val.credentials));
//lookup table of id:screen_name k:vs
const lookup = _.mapObject(accounts, val => val.screen_name);
//fuck it think of a better way to implement this later
*/
