var fs = require("fs");
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

var twit = require("twit");
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

var stream = t.stream("user");

//incoming tweets are of the form "@botmistress make [id1] follow [id2]" "@botmistress enthrall [id] via [path]"
//assume well-formed input, it doesn't even look at the thing unless it's from the mistress
stream.on("tweet", function(tweet) {
	//if it's not from me, exit immediately. perhaps do other things in the future
	if(tweet.user.id !== api.mistress) return;
	
	//make an array of each individual word
	var words = (tweet.text).trim().split(" ");
	//exit if not an @reply or a dot-reply
	if(words[0] != "@" + self.screen_name && words[0] != ".@" + self.screen_name) return;
	//exit if asleep and command is not "wake"
	if(!self.awake && words[1] != "wake") return;

	//so now it's definitely from me and directed at her, we can switch on command words
	//but again, in the future I can do fun things
	//this obj is just to keep the syntax cleaner
	var cmd = {
		word: words[1],
		chain: words[3],
		targets: [words[2],words[4]]
	};

	cmd.targets.forEach(function(element, index) {
		if(element) {
		       if(element.charAt(0) == "@") cmd.targets[index] = element.substr(1);
		       if(element == "me") cmd.targets[index] = tweet.user.screen_name;
		       if(element == "you" || element == "self" || element == "yourself" || element == "yrself") cmd.targets[index] = self.screen_name;
		}
	});

	console.log("cmd before switch: " + cmd);
	switch(cmd.word) {
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
					      reply("@" + tweet.user.screen_name + " I'm sorry, I couldn't find " + cmd.targets[0] + " on Twitter", tweet.id);
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
					      reply("@" + tweet.user.screen_name + " " + data.name + " is now in my clutches", tweet.id);
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
//							reply("@" + tweet.user.screen_name + " I have forged a bond",tweet.id);
					});
					break;
				case "unfollow":
					tt.post("friendships/destroy", pop_user(cmd.targets[1]),
						function(err, data, response) {
							if(err) throw err;
//							reply("@" + tweet.user.screen_name + " The bond is broken",tweet.id);
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
				case "tweet":
				case "delete":
		}
			//stuff here
			break;
	}
});

//maybe let this take a real callback later, for now it's just tweeting the status of an op after we're finished
function reply(status, origin_id) {
	t.post("statuses/update", { status: status, in_reply_to_status_id: origin_id }, function(err, data, response) { });
}

//fills a user obj for stuff like users/show, friendships/create, etc
function pop_user(user) {
	return typeof user == "number" ? {user_id: user} : {screen_name: user};
}
