"use strict";

const fs = require("fs");
const path = require("path");
const _ = require("underscore");
const twee = require(path.join(__dirname,"lib","twitwrap.js"));

const accounts = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "thralls.json"), "utf8"));

//two very special objects
const insect = _.extend(new twee.make(accounts["63506279"].credentials),{
	id_str: "63506279",
	screen_name: "alicemazzy",
	name: "Alice Maz",
	alias: ["Alice","alice","insect","me","my","myself"]
});

const mistress = _.extend(new twee.make(accounts["3168258306"].credentials), {
	id_str: "3168258306",
	screen_name: "botmistress",
	name: "mistress@vesta:~#",
	sleepName: "mistress@vesta:~$",
	alias: ["Mistress","mistress","you","your","yourself","yrself","self"]
});

//however many boring objects
const thralls = _.chain(accounts)
	.omit("63506279","3168258306")
	.mapObject(val => new twee.make(val.credentials))
	.value();

//open a stream...
const stream = twee.stream(mistress);

//...and handle input
stream.on("tweet", tweet => console.log("TWEET START\n" + JSON.stringify(tweet) + "\nTWEET END"));


/*
mistress.tweet({status: "test initial 17"},(err,data) => {
	if(err) throw err;
	console.log("test1");
	mistress.reply({status: "test reply 17", reply_id: data.id_str, omit_handle: true},err => {
		console.log("test2");
		if(err) throw err;
	});
});


/*
 * THIS IS ALL GARBAGE JUST FOR REFERENCE zzzz
 *
	//twit objects for all accounts
	this.twitters = _.mapObject(accounts, val => new twit(val.credentials));
	//lookup table of k:v ==  id:screen_name
	this.lookup = _.mapObject(accounts, val => val.screen_name);

	//I'd like this to console.log stuff saying what bots are loaded, no errors, etc
	//think abt actor model... can there be like a "logger" actor that any module can pass to?


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
