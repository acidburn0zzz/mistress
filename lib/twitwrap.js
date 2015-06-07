//container for twit credentials + wrapper for api calls
//eventually I will nix the callbacks altogether and just return promises from everything
"use strict";

const twit = require("twit");
const _ = require("underscore");

const Twitwrap = function(auth) {
	this.auth = new twit(auth);
}

Twitwrap.prototype = {
	//posts a tweet
	//{status: "", body: {}}, callback()
	tweet: (args, callback) => {
		var body = args.body || { status: args.status };
		this.auth.post("statuses/update", body, callback);
	},

	//replies to a tweet
	//{prefix: "", status: "",reply_id: "", omit_handle: false,  body: {}}, callback()
	reply: (args, callback) => {
		var self = this;

		var prefix = args.prefix || "";
		var status = args.status || "";

		var p = new Promise((resolve,reject) => {
				    self.getTweet({body: {id: args.reply_id}}, (err, data) => {
					    err ? reject(err) : resolve(data.user.screen_name);
				    });
		});

		p.then(screen_name => {
			var body = args.body || {
				status: args.omit_handle ? [prefix,status].join("") : [prefix,"@",screen_name," ",status].join(""),
				in_reply_to_status_id: args.reply_id 
			};

			self.tweet({body: body}, callback);
		}).catch(err => console.log("promise rejected\n",err));
	},

	//get user by id or sn
	getUser: (args, callback) => {
		var body = args.body || (args.id_str ? {id: args.id_str} : {screen_name: args.screen_name});
		this.auth.get("users/show", body, callback);
	},

	//get tweet by id
	getTweet: (args, callback) => {
		var body = args.body || {id: args.id_str };
		this.auth.get("statuses/show/:id", body, callback);
	},

	//get ~3000 tweets off a user tl
	//ratelimit-safe
	//{id_str: "", screen_name: ""}
	pulldown: (args) => {
		const self = this;
		const body = _.extend(args.id_str ? {user_id: args.id_str} : {screen_name: args.screen_name},
							  {count: 200, trim_user: true, include_rts: true, exclude_replies: false});

		const chainer = oldData => {
			return new Promise((resolve,reject) =>
				self.auth.get("statuses/user_timeline", _.extend(body,{max_id: _.last(oldData).id_str}), (err,data) =>
					err ? reject(err) : resolve(oldData.concat(data))))
				.then(data => data.length > 3000 ? data : chainer(data));
		};

		return this._limit("statuses","/statuses/user_timeline",20)
			.then(() => new Promise((resolve,reject) =>
				self.auth.get("statuses/user_timeline",body, (err,data) =>
					err ? reject(err) : resolve(data))))
			.then(data => chainer(data));
	},

	//check ratelimit
	//used internally, returns a promise that resolves to true if we're happy
	_limit: (resources, resource, lim) => {
		const self = this;
		return new Promise((resolve,reject) =>
			self.auth.get("application/rate_limit_status", {resources: resources}, (err,data) =>
				err ? reject(err) : data.resources[resources][resource].remaining < lim ?
				reject(new Error("Dangerously close to the rate limit!")) :
				resolve(true)));
	}
}

module.exports = Twitwrap;
