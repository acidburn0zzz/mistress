//execute option for mistress, this handles all logic wrt streams
"use strict";

module.exports = () => {
	const stream = this.auth.stream("user");

	console.log("stream open");

	stream.on("tweet", tweet => console.log("TWEET START\n" + JSON.stringify(tweet) + "\nTWEET END"));
};
