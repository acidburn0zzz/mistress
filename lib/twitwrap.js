//wrapper for common twit calls I make, receiving credentials and callbacks as args
//"main" is the default acct to use if no arg is passed

//--
"use strict";

const path = require("path");
const twit = require("twit");
const _ = require("underscore");

const pool = require(path.join(__dirname,"datapool.js"));
//--

var Twitwrap = function(main) {
	this.main = main;
}

Twitwrap.prototype = {
	//posts a tweet
	//since lzw encoding merely transforms status, provide a diff fn for that
	//valid method signatures:
	//* (twit, status, callback)
	//* (twit, {status: status, other_stuff: stuff}, callback)
	//* (status,callback)
	//* ({status: status, other_stuff: stuff},callback)
	t: () => {
		var client = arguments.length == 3 ? _.first(arguments) : this.main;
		var status = _.chain(arguments).initial().last().value();
		var callback = _.last(arguments);

		var params = typeof status == "string" ? { status: status } : status;

		client.post("statuses/update", params, callback);
	}
}

module.exports = Twitwrap;

/*console.log(client,status,callback);
//if(typeof status == "string") console.log("string!!");
	}
}


/*
var test = new Twitwrap("default value");
var t1 = test.t("tweet1","callback1");
var t2 = test.t("client2","tweet2","callback2");





/*
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
