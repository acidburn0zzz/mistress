//wrapper for common twit things I do and the config files of this project
//the idea is... hm actually should I split the creation of twit objects from the actual tweeting code?
"use strict";

//temp
var mid = 63506279;

var fs = require("fs");
var twit = require("twit");
var _ = require("underscore");
var path = require("path");

var thrallsP = new Promise(fs.readFile(path.join(__dirname,"thralls
//load up and build our data
var accounts = JSON.parse(fs.readFileSync(__dirname + "/thralls.json", "utf8"));

//twit objects for all accounts
const t = _.mapObject(accounts, val => new twit(val.credentials));
//lookup table of id:screen_name k:vs
const lookup = _.mapObject(accounts, val => val.screen_name);
//fuck it think of a better way to implement this later
