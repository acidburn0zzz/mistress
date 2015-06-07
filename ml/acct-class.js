"use strict";

const fs = require("fs");
const path = require("path");
const _ = require("underscore");
const async = require("async");

_.mixin({
	norm: arr => {
		const min = _.min(arr);
		const max = _.max(arr);
		return _.map(arr, val => (val-min)/(max-min));
	},

	core: arr => _.reduce(arr, (m,n) => m+n, 0)/arr.length
	
});

const mean = x => {
	return _.chain(x)
				.norm()
				.core()
				.value();
};

const dev = x => {
	const m = mean(x);

	return Math.sqrt(
				_.chain(x)
					.norm()
					.map(val => Math.pow(val-m,2))
					.core()
					.value()
	);
};

const nani = x => {
	return _.isNaN(x) ? 0 : x;
};

const doStuff = raw => {
//obj of arrays of timestamps grouped by date, prolly use for other stuff later
	const datemap = _.chain(raw)
						.n(val => _.has(val,"retweeted_status"))
						.map(val => new Date(val.created_at).toISOString())
						.groupBy(val => val.slice(0,10))
						.value();

	const rtMap = _.chain(raw)
						.filter(val => _.has(val,"retweeted_status"))
						.map(val => new Date(val.created_at).toISOString())
						.groupBy(val => val.slice(0,10))
						.value();

	const tweetsPerDay = _.chain(datemap)
							.values()
							.map(val => val.length)
							.value();

	const secs = _.chain(datemap)
					.values()
					.flatten()
					.map(val => val.slice(17,19))
					.value();

	const rtsPD = _.chain(rtMap)
						.values()
						.map(val => val.length)
						.value();

	return {
		//normed avg of tweets per day
		mtpd: mean(tweetsPerDay),
		dptd: dev(tweetsPerDay),

		//" of timestamp second values
		msec: mean(secs),
		dsec: dev(secs),

		//" of rts per day
		mrt: nani(mean(rtsPD)),
		drt: nani(dev(rtsPD))
	};
};

//const raw = JSON.parse(fs.readFileSync(path.join(__dirname, "training","bot","believebarbossa.json"), "utf8"));

const botFs = _.map(fs.readdirSync(path.join(__dirname, "training","bot")),
					val => path.join(__dirname, "training","bot", val))
			.slice(0,3);
const humanFs = _.map(fs.readdirSync(path.join(__dirname, "training","human")),
					val => path.join(__dirname, "training","human", val))
			.slice(0,3);

const ld = new Date();
console.log(`${botFs.length+humanFs.length} files found`,"\nLoading...");

const bots = new Promise((y,n) => async.map(botFs, fs.readFile, (err,data) =>
					err ? n(err) : y(data)))
				.then(data => _.map(data,JSON.parse))
				.catch(err => console.log("problem loading bots:\n",err));
const humans = new Promise((y,n) => async.map(humanFs, fs.readFile, (err,data) =>
					err ? n(err) : y(data)))
				.then(data => _.map(data,JSON.parse))
				.catch(err => console.log("problem loading humans:\n",err));

Promise.all([bots,humans]).then(data => console.log(`Load complete in ${Math.round((new Date()-ld)/1000)}s`));

bots.then(data => console.log(JSON.stringify(data[0],null,"\t"),data[0].length));
