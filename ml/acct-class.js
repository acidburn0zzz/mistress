"use strict";

const fs = require("fs");
const path = require("path");
const _ = require("underscore");
const async = require("async");
const brain = require("brain");
const ζ = require(path.join(__dirname,"..","zeta.js"));

ζ();

const net = new brain.NeuralNetwork();

//normalize then average
const mean = x => {
	return _.chain(x)
				.norm()
				.core()
				.value();
};

//normalize then get standard deviation
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

//function that takes a pulldown array and returns 
const doStuff = raw => {
//obj of arrays of timestamps grouped by date, prolly use for other stuff later
	const datemap = _.chain(raw)
						.reject(val => _.has(val,"retweeted_status"))
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

	const result = {
		//normed avg of tweets per day
		mtpd: nani(mean(tweetsPerDay)),
		dptd: nani(dev(tweetsPerDay)),

		//" of timestamp second values
		msec: nani(mean(secs)),
		dsec: nani(dev(secs)),

		//" of rts per day
		mrt: nani(mean(rtsPD)),
		drt: nani(dev(rtsPD))
	};

	console.log("inside acctclass:\n",JSON.stringify(result,null,"\t"));

	return result;
};

//hacky bullshit but here's an export that can analyze based on this model
module.exports = pulleddown => {return {input: doStuff(pulleddown) }};


//this is where the model-building begins
/* --------------------------------------------

//const raw = JSON.parse(fs.readFileSync(path.join(__dirname, "training","bot","believebarbossa.json"), "utf8"));

const botFs = _.map(fs.readdirSync(path.join(__dirname, "training","bot")),
					val => path.join(__dirname, "training","bot", val))
//			.slice(0,3);
const humanFs = _.map(fs.readdirSync(path.join(__dirname, "training","human")),
					val => path.join(__dirname, "training","human", val))
//			.slice(0,3);


//this was a lil experiment with async but it turned out not to even matter lol
const ld = new Date();
console.log(`${botFs.length+humanFs.length} files found`,"\nLoading...");

const bots = new Promise((y,n) => async.map(botFs, fs.readFile, (err,data) =>
					err ? n(err) : y(data)))
				.then(data => new Promise((y,n) => async.map(data, (item,callback) =>
					callback(null,JSON.parse(item)), (err,data) =>
					err ? n(err) : y(data))))
				.catch(err => console.log("problem loading bots:\n",err));
const humans = new Promise((y,n) => async.map(humanFs, fs.readFile, (err,data) =>
					err ? n(err) : y(data)))
				.then(data => new Promise((y,n) => async.map(data, (item,callback) =>
					callback(null,JSON.parse(item)), (err,data) =>
					err ? n(err) : y(data))))
				.catch(err => console.log("problem loading humans:\n",err));

Promise.all([bots,humans]).then(data => console.log(`Load complete in ${Math.round((new Date()-ld)/1000)}s`));

const bdata = bots
				.then(data => _.map(data, val => { return {input: doStuff(val), output: {bot: 1}}}))
				.catch(err => console.log("error doing stuff:\n",err));

const hdata = humans
				.then(data => _.map(data, val => { return {input: doStuff(val), output: {human: 1}}}))
				.catch(err => console.log("error doing stuff:\n",err));

Promise.all([bdata,hdata])
	.then(data => net.train(_.flatten(data), {log: true, logPeriod: 100}))
	.then(() => {
		fs.writeFile(path.join(__dirname,"test.fn"), net.toFunction().toString(), "utf8", err => {if(err) throw err;});
		fs.writeFile(path.join(__dirname,"test.model"), JSON.stringify(net.toJSON(),null,"\t"), "utf8", err => {if(err) throw err;});
	}).catch(err => console.log("problem constructing model:\n",err));
   */
