"use strict";

const fs = require("fs");
const path = require("path");
const _ = require("underscore");

_.mixin({
	norm: arr => {
		const min = _.min(arr);
		const max = _.max(arr);
		return _.map(arr, val => (val-min)/(max-min));
	},

	core: arr => _.reduce(arr, (m,n) => m+n, 0)/arr.length
	
});


const raw = JSON.parse(fs.readFileSync(path.join(__dirname, "training", "suit.json"), "utf8"));

//obj of arrays of timestamps grouped by date, prolly use for other stuff later
const datemap = _.chain(raw)
					.reject(val => _.has(val,"retweeted_status"))
					.map(val => new Date(val.created_at).toISOString())
					.groupBy(val => val.slice(0,10))
					.value();

const tweetsPerDay = _.chain(datemap)
						.values()
						.map(val => val.length)
						.value();

const meanTPD = _.chain(tweetsPerDay)
					.norm()
					.core()
					.value();

const devTPD = Math.sqrt(
	_.chain(tweetsPerDay)
		.norm()
		.map(val => Math.pow(val-meanTPD,2))
		.core()
		.value()
);

//const downtimePerDay = _.chain(datemap)
//							.values()

console.log(meanTPD, devTPD);
