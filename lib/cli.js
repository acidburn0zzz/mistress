//execute option for mistress, this processes cli input
//essentially a simple interface to run js code that depends on her rather than replicating her elsewhere
"use strict";

const fs = require("fs");
const path = require("path");
const _ = require("underscore");

//clip "[io,mistress.js]"
const cmd = process.argv[2];
const args = process.argv.slice(3);

//helper fn to get the value for a flag key
const flag = (f) => {
	return args[_.indexOf(args,"-"+f)+1];
};

//possible execution paths, determined by args[0]
const fns = {
	//bindings to convert cli args to twee calls
	//I really need to do some kinda generic error handler or smth, _.noop is badbadbad
	tweet: () => this.tweet({status: _.last(args)},_.noop),

	reply: () => this.reply({status: _.last(args), reply_id: flag("r")},_.noop),

	testpull: () => this.auth.get("statuses/mentions_timeline", {screen_name: "alicemazzy", count: 1, trim_user: true}, (err,data) => console.log(JSON.stringify(data))),

	limits: () => this.auth.get("application/rate_limit_status", args.length > 0 ? {resources: _.last(args)} : {}, (err,data) => {
		if(err) throw err; else console.log(JSON.stringify(data,null,"\t"));
	}),

	//other fun things, later move I guess
	pulldown: () => {
		console.log(`pulldown of @${_.last(args)} beginning...`);
		const d = new Date();
		this.pulldown({screen_name: _.last(args)})
			.then(data => {
				console.log(`pulled ${data.length} tweets in ${Math.round((new Date() - d)/1000)} seconds!`,"\nsaving...");
				fs.writeFile(path.join(__dirname,"..","ml","training","bot",_.last(args)+".json"),JSON.stringify(data,null,"\t"),"utf8",
					err=>{
						if(err) throw err;
						console.log(`saved to ${path.join(__dirname,"..","ml","training","bot",_.last(args)+".json")}`);
					});
			});
	},

	//mostly for testing I guess, prolly useless
	noop: () => {}

};

module.exports = fns[cmd]; 
