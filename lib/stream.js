//execute option for mistress, this handles all logic wrt streams
"use strict";

var path = require("path");
//var fs = require("fs");
//var brain = require("brain");

module.exports = () => {
	const stream = this.auth.stream("user");

	console.log("stream open");

//!\\ EVERYTHING BELOW THIS LINE IS GARBAGE //!\\
//    DELETE AND REWITE DO NOT ATTEMPT TO REFACTOR
//-----------------------------------------------\\
	var buildData = require(path.join(__dirname,"..","ml","acct-class.js"));
	var analyze = require(path.join(__dirname,"..","ml","test.js"));

	var tweetarr = [];
	var self = this;
//	var net = new brain.NeuralNetwork();
//	net.fromJSON(JSON.parse(fs.readFileSync(path.join(__dirname,"..","ml","test.json"))));

	stream.on("tweet", tweet => {
		console.log("text:",tweet.text);
		if(tweet.user.screen_name == "alicemazzy" && tweet.text.slice(0,12) == "@botmistress") {
			tweetarr.push(tweet.text.slice(14).trim());
			console.log("tweetarr:\n",tweetarr);
		}
	});

	setInterval(() => {
		if(tweetarr.length > 0) {
			var target = tweetarr.pop();
			console.log("pulling down",target);
			var rawP = self.pulldown({screen_name: target});

			rawP.then(data => buildData(data))
//				.then(data => console.log("buildData returns:\n",JSON.stringify(data,null,"\t")))
				.then(data => analyze(data.input))
				.then(data => {
					var botornot = data.bot > data.human ?
						{num: Number((data.bot*100).toFixed(1)), what: "bot"} :
						{num: Number((data.human*100).toFixed(1)), what: "human"};

					self.tweet({"status": `@alicemazzy I am ${botornot.num}% sure @${target} is a ${botornot.what}`});
				});
		}
	}, 1000*10);



//	stream.on("tweet", tweet => console.log("TWEET START\n" + JSON.stringify(tweet) + "\nTWEET END"));
};


