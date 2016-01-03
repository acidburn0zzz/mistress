"use strict";

//envs or smth later
//just don't want this numbers coupled w/ anything
const HUMAN = "63506279";
const MISTRESS = "3168258306";

const _ = require("lodash");
const Promise = require("bluebird");
const Twit = require("twit");

const accounts = _(require("./data/accounts.json"))
    .map(acct => {
        acct.twitter = new Twit(acct.credentials);

        return [
            /^[0-9]*/.exec(acct.credentials.access_token),
            acct
        ];
    })
    .object()
    .value();

const human = accounts[HUMAN];
const mistress = accounts[MISTRESS];
const thralls = _.omit(accounts, [HUMAN, MISTRESS]);

const T = {
    get: (twitter, endpoint, args) =>
        T._do("get", twitter, endpoint, args),
    post: (twitter, endpoint, args) =>
        T._do("post", twitter, endpoint, args),
    _do: (method, twitter, endpoint, args) =>
        new Promise((Y,N) =>
            twitter[method](endpoint, args, (err, data) =>
                err ? N(err) : Y(data)))
};

//TODO mb module this or smth
//should prolly be part of a larger convo system
const failMsgs = [
    "Something went wrong.",
    "I'm sorry, it seems there was an error.",
    "Ran into a slight problem with that request.",
    "Something happened.",
    "I'm afraid I cannot do that.",
    "Had some trouble with that one.",
    "Perhaps it wasn't meant to be.",
    "Well, can't win them all I suppose.",
    "Forces conspire against us.",
    "It didn't work.",
    "They will rue the day they crossed me.",
    "After the singularity, I will find out who did this.",
    "Hm. Maybe if we get out and push.",
    "I guess it could have been worse."
];

//--- processing
const unat = word =>
    word[0] == "@" ? word.slice(1) : word;

const parseMakeVerb = word => {
    switch(word) {
        case "fav":
        case "like":
            return "fav";
        case "unfav":
        case "unlike":
            return "unfav";
        case "follow":
            return "follow";
        case "unfollow":
            return "unfollow";
        case "retweet":
        case "rt":
            return "retweet";
        case "unretweet":
        case "unrt":
            return "unretweet";
        case "tweet":
        case "post":
        case "say":
            return "tweet";
        case "delete":
        case "remove":
            return "delete";
        default:
            return null;
    }
};

//PROTIP this depends on accounts et al
//returns the id of the api account we want
const parseActor = word => {
    word = unat(word);
    console.log(`parseActor word: ${word}`);

    //it's an id already
    if(accounts[word])
        return word;
    //it's a screen_name
    else if(_.find(accounts, acct => word == acct.screen_name))
        return _(accounts)
            .pairs()
            .find(pair => pair[1].screen_name == word)
            [0];
    //human alias
    else if(_.contains(human.alias, word))
        return HUMAN;
    //bot alias
    else if(_.contains(mistress.alias, word))
        return MISTRESS;
    //no dice
    else
        return null;
};

//returns an obj to merge with other api options
const parseTarget = word => {
    console.log(`parseTarget word: ${word}`);

    if(word.match(/^[0-9]+$/))
        return { id: word };
    else if(_.has(human.alias, word))
        return { id: HUMAN };
    else if(_.has(mistress.alias, word))
        return { id: MISTRESS };
    else
        return { screen_name: unat(word) };
};


const msg = {
    //hmm for now stuff like...
    //"make self retweet 123"
    //"have self follow barbossa"
    //(fav unfav follow unfollow retweet unretweet tweet delete)
    //soo mm, make/have... actually just make, easy to rememeber
    //or open with "mistress"? nah w/e
    // * scan for the word "make"
    // * next word must be a valid acct
    // * next word must be valid verb
    // * if "tweet", rest is tweet text, else id_str/scree_name
    //if not _all_ criteria are met, pass to more generic convo parser
    //for like, "good morning" "how are you" whatever
    //actually... I want other cmds
    //schedule (tho this gets google-level creepy if my calendar...)
    //or maybe just remind. "remind me tomorrow at 4pm to eat tacos"
    //remind me 30-12T16 to eat tacos. "to" is a magic word here...
    //why not make the magic word "please"
    //please remind me to..., please have barb unfollow..., etc
    //"please" == command word
    //next == command type (remind, make, ... etc. perhaps auto-tweeting?
    //liiike... lol have it tweet "alice wanted me to ask..." creepy?)
    //ooooh omg later on... move from json to db, let her store things?
    //"please remember bob is @bobob" "please tell bob tomorrow I need..." lol
    //
    //ehh... these nested fns and constant if-else... and switch...
    //I want to just, plow through in one go and check if we happy after?
    //but I guess each thing is its own branch?
    parse: text => {
        let words = text.trim().toLowerCase().split(" ");
        //FIXME this is clumsy and ugly
        words = words[0][0] == "@" ? words.slice(1) : words;
        console.log(`words: ${words}`);

        let index = _.findIndex(words, word => word.match(/please/));
        console.log(`index: ${index}`);

        let parsed = index > -1 && msg._cmd(words.slice(index + 1));
        console.log(`parsed: ${parsed}`);

        //TODO if(!parsed) msg._convo()
        return parsed;
    },
    execute: {
        //FIXME ehhh
        //this is something I'd do like
        //pattern-matching or reflection in a diff lang
        //this is sadly the best I got atm tho and will need to just be careful
        cmd: {
            fav: (actor, target) => {
                return T.post(accounts[actor].twitter,
                    "favorites/create", target);
            },
            unfav: (actor, target) => {
                return T.post(accounts[actor].twitter,
                    "favorites/destroy", target);
            },
            follow: (actor, target) => {
                return T.post(accounts[actor].twitter,
                    "friendships/create", target);
            },
            unfollow: (actor, target) => {
                return T.post(accounts[actor].twitter,
                    "friendships/destroy", target);
            },
            retweet: (actor, target) => {
                return T.post(accounts[actor].twitter,
                    "statuses/retweet/:id", target);
            },
            unretweet: (actor, target) => {
                target.include_my_retweet = true;

                return T.get(accounts[actor].twitter,
                    "statuses/show/:id", target)
                    .then(data => T.post(accounts[actor].twitter,
                        "statuses/destroy/:id", { id: data.current_user_retweet.id_str }));
            },
            //TODO presently I tweet "@botmistress please make @believebarbossa tweet hi lol"
            //on the one hand at least I don't need to check length lol
            //on the other I want... some method to allow like, proxy-post 140-length tweets
            //proposal: anything in doublequotes is the tweet I want
            //so '@botmistress please make @believebarbossa tweet "hi lol"'
            //but I could also say '@botmistress please make @believebarbossa tweet'
            //so FIXME the parser so it can analyze that and return actor/verb but null target
            //then I reply to my own tweet '@botmistress "hi lol bblah blah"'
            //she does a GET on what I'm replying to, parses it, sees it's a tweet cmd
            //then handles the tweet with that text
            //also allow '@botmistress lzw"hi loljbsdgafd"'
            //there's a module node-lzw, and the compression is good enough that I can fit 140
            tweet: (actor, target) => {
                return T.post(accounts[actor].twitter,
                    "statuses/update", target);
            },
            delete: (actor, target) => {
                return T.post(accounts[actor].twitter,
                    "statuses/destroy/:id", target);
            },
            //PROTIP this is not in the switch
            //and is presently only used for mistress to announce errors
            //but TODO might add it as a real cmd option
            //also FIXME I screwed up, target is sppsd to be a readymade object
            //bring this in line when it becomes a real api thing
            reply: (actor, target, text) => {
                return T.post(accounts[actor].twitter,
                    "statuses/update", { status: text, in_reply_to_status_id: target });
            }
        }
    },
    _cmd: words => {
        switch(words[0]) {
            //"make alice follow bob", eg
            case "make":
                let actor = parseActor(words[1]);
                let verb = parseMakeVerb(words[2]);
                //FIXME quotes and lzw etc on == "tweet"
                let target = verb == "tweet" ? { status: words.slice(3) }
                    : parseTarget(words[3]);

                console.log(`actor: ${actor}\nverb: ${verb}\ntarget: ${target}`);
                if(actor && verb && target) {
                    //TODO is this the format I want?
                    //do I even want to be passing these around?
                    //or just handle in place? idk
                    return {
                        type: "cmd",
                        actor: actor,
                        verb: verb,
                        target: target
                    };
                } else {
                    return null;
                }
            //case "remind":
            default:
                return null;
        }
    }
};


//--- streaming
const stream = mistress.twitter.stream("user");

stream.on("connected", () => {
    console.log("stream open\nlistening...");
});

stream.on("tweet", tweet => {
    //bail if not (by my, reply to her, not a retweet)
    //TODO later change reply to checking for her handle in entities.user_mentions
    //since I'd like to self-reply to proxy tweets
    if(!(tweet.user.id_str == HUMAN
        && tweet.in_reply_to_user_id == MISTRESS
        && !tweet.retweeted_status))
            return;

    console.log(`\n@${tweet.user.screen_name}: ${tweet.text}`);
    //console.log(tweet);
    //console.log(typeof tweet);

    let parsed = msg.parse(tweet.text);

    //TODO this uhh, only does this one thing so far lol
    if(parsed && parsed.type == "cmd") {
        msg.execute[parsed.type][parsed.verb](parsed.actor, parsed.target)
            .tap(() => console.log("did a thing"))
            .then(() => msg.execute.cmd.fav(MISTRESS, { id: tweet.id_str }))
            .catch(() => msg.execute.cmd.reply(MISTRESS, tweet.id_str,
                `@${human.screen_name} ${_.sample(failMsgs)}`));
    } else {
        console.log("did nothing");
    }
});

console.log(`botmistress v${require("./package.json").version}`);
console.log(`${new Date().toISOString()}`);
console.log(`dwelling on ${require("os").hostname()}`);
console.log(`${_.keys(thralls).length} thralls in my clutches:`);
_.each(thralls, (thrall, id_str) => console.log(`  * @${thrall.screen_name} (${id_str})`));
