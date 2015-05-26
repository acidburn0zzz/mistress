//THIS IS UNUSED
//just keeping it for now for reference/convenience
var fs = require("fs");
var twit = require("twit");
var lzw = require("node-lzw");

var api = JSON.parse(fs.readFileSync(__dirname + "/config.json", "utf8"));

var thralls = {};
try {
	var file = fs.readFileSync(__dirname + "/thralls.json", "utf8");
	thralls = JSON.parse(file);
} catch(e) {
	if(e.code == "ENOENT") {
		fs.writeFileSync(__dirname + "/thralls.json", JSON.stringify(thralls), "utf8", 644);
		console.log("created new file thralls.json");
	} else throw e;
}

var t = new twit({
	consumer_key: api.key,
	consumer_secret: api.secret,
	access_token: api.token,
	access_token_secret: api.token_secret
});

var self = {};

t.get("users/show", { id: api.self }, function(err, data, response) {
	if(err) throw err;
	self.id = data.id;
	self.screen_name = data.screen_name;
	self.name = (data.name).slice(0,-1);
	self.awake = (data.name).slice(-1) == "#" ? true : false;
	console.log("name: " + self.name + "\nAwake: " + self.awake);
});

var mistress = {};

t.get("users/show", { id: api.mistress }, function(err, data, response) {
	if(err) throw err;
	mistress.id = data.id;
	mistress.screen_name = data.screen_name;
	mistress.name = data.name;
	mistress.first_name = (data.name).split(" ")[0];
	console.log("mistress: " + JSON.stringify(mistress));
});

var stream = t.stream("user");

//incoming tweets are of the form "@botmistress make [id1] follow [id2]" "@botmistress enthrall [id] via [path]"
//assume well-formed input, it doesn't even look at the thing unless it's from the mistress
stream.on("tweet", function(tweet) {

	console.log("TWEET START\n" + JSON.stringify(tweet) + "\nTWEET END");
	//if it's not from me, exit immediately. perhaps do other things in the future
	if(tweet.user.id !== mistress.id) return;
	
	//make an array of each individual word
	var words = (tweet.text).trim().split(" ");
	//exit if not an @reply or a dot-reply
	if(words[0] != "@" + self.screen_name && words[0] != ".@" + self.screen_name) return;
	//exit if asleep and command is not "wake" or "status"
	if(!self.awake && !(words[1] == "wake" || words[1] == "status")) return;

	//so now it's definitely from me and directed at her, we can switch on command words
	//but again, in the future I can do fun things
	//this obj is just to keep the syntax cleaner
	var cmd = {
		word: words[1],
		chain: words[3],
		targets: [words[2],words[4]]
	};

	if(cmd.chain == "post" || cmd.chain == "tweet") cmd.targets[1] = words.slice(4).join(" ");

	cmd.targets.forEach(function(element, index) {
		if(element) {
		       if(element.charAt(0) == "@") cmd.targets[index] = element.substr(1);
		       if(element == "me") cmd.targets[index] = tweet.user.screen_name;
		       if(element == "you" || element == "self" || element == "yourself" || element == "yrself") cmd.targets[index] = self.screen_name;
		}
	});

	console.log("cmd before switch: " + cmd);
	switch(cmd.word) {
		case "status":
			reply("@" + mistress.screen_name + " Hello, " + mistress.first_name + ". I'm presently " + (self.awake ? "awake" : "resting") + ". I have " + Object.keys(thralls).length/2-1 + " bots under my control.", tweet.id_str);
			break;
		case "rest":
			if(!self.awake) return;
			t.post("account/update_profile", { name: self.name + "$" }, function(err, data, response) {
				if(err) throw err;
				self.awake = false;
				//reply
			});
			break;
		case "wake":
			if(self.awake) return;
			t.post("account/update_profile", { name: self.name + "#" }, function(err, data, response) {
				if(err) throw err;
				self.awake = true;
				//reply
			});
			break;
		//enthrall [user_id or (@)screen_name] via [dir_name]
		case "enthrall":
			t.get("users/show", pop_user(cmd.targets[0]),
			      function(err, data, response) {
				      if(err) {
					      reply("@" + mistress.screen_name + " I'm sorry, I couldn't find " + cmd.targets[0] + " on Twitter", tweet.id_str);
					      return;
				      }

				      //assumes mistress dir is in same dir as bots
				      var target_config = JSON.parse(fs.readFileSync(__dirname + "/../" + cmd.targets[1] + "/config.json", "utf8"));

				      //this erm, may not be the best way to implement bidirectional lookup
				      thralls[data.id] = {
					      screen_name: data.screen_name,
					      key: target_config.key,
					      secret: target_config.secret,
					      token: target_config.token,
					      token_secret: target_config.token_secret
				      };

				      thralls[data.screen_name] = {
					      id: data.id,
					      key: target_config.key,
					      secret: target_config.secret,
					      token: target_config.token,
					      token_secret: target_config.token_secret
				      };

				      //now write to file, async so our "all good" only sends on success
				      fs.writeFile(__dirname + "/thralls.json", JSON.stringify(thralls), "utf8", 600, function(err) {
					      if(err) throw err;
					      reply("@" + mistress.screen_name + " " + data.name + " is now in my clutches", tweet.id_str);
				      });
			      });
			break;
		//make [id1] [verb] [id2]
		case "make":
			var tt = new twit({
				consumer_key: thralls[cmd.targets[0]].key,
				consumer_secret: thralls[cmd.targets[0]].secret,
				access_token: thralls[cmd.targets[0]].token,
				access_token_secret: thralls[cmd.targets[0]].token_secret
			});

			//aaaaaand this is the moment I'm like "ok this function is getting out of hand"
			//comment out the replies for now, need to either tweet relevant data or make a pool of "It is done" msgs
			//thanks to Twitter's duplicate tweet thing
			switch(cmd.chain) {
				case "follow":
					tt.post("friendships/create", pop_user(cmd.targets[1]),
						function(err, data, response) {
							if(err) throw err;
//							reply("@" + mistress.screen_name + " I have forged a bond",tweet.id_str);
					});
					break;
				case "unfollow":
					tt.post("friendships/destroy", pop_user(cmd.targets[1]),
						function(err, data, response) {
							if(err) throw err;
//							reply("@" + mistress.screen_name + " The bond is broken",tweet.id_str);
					});
					break;
				case "fav":
					tt.post("favorites/create", { id: cmd.targets[1] },
						function(err, data, response) {
							if(err) throw err; //later make it tweet instead
							//reply here
					});
					break;
				case "unfav":
					tt.post("favorites/destroy", { id: cmd.targets[1] },
						function(err, data, response) {
							if(err) throw err; //later make it tweet instead
							//reply here
					});
					break;
				case "rt":
				case "retweet":
					tt.post("statuses/retweet/:id", { id: cmd.targets[1] },
						function(err, data, response) {
							if(err) throw err;
							//reply here
					});
					break;
				//these are a lil weirder-looking bc of Twitter api weirdness
				//rts themselves have a unique id, this looks that id up given the original tweet's id
				case "unrt":
				case "unretweet":
					tt.get("statuses/show/:id", { id: cmd.targets[1], include_my_retweet: true },
					       function(err, data, response) {
						       if(err) throw err;
	console.log("RT DATA START\n" + JSON.stringify(data) + "\nEND");
						       tt.post("statuses/destroy/:id", { id: data.current_user_retweet.id_str },
							       function(err, data, response) {
							       if(err) throw err;
							       //reply here
							});
					});
					break;
				case "post":
				case "tweet":
					var status = lzw.decode(cmd.targets[1].split("").map(function(it){return String.fromCharCode(it.charCodeAt()-1)}).join(""));
				console.log("status test: " + status + "\nlen: " + status.length);
					tt.post("statuses/update", { status: status },
						function(err, data, response) {
							if(err) throw err;
							//reply here
					});
					break;
				case "delete":
					tt.post("statuses/destroy/:id", { id: cmd.targets[1] },
						function(err, data, response) {
							if(err) throw err;
							//reply here
					});
					break;
		}
			//stuff here
			break;
	}
});

//maybe let this take a real callback later, for now it's just tweeting the status of an op after we're finished
function reply(status, origin_id) {
	t.post("statuses/update", { status: status, in_reply_to_status_id: origin_id }, function(err, data, response) {
		console.log("reply to tweet: " + origin_id);
	});
}

//fills a user obj for stuff like users/show, friendships/create, etc
function pop_user(user) {
	return typeof user == "number" ? {user_id: user} : {screen_name: user};
}
