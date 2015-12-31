"use strict";

//envs or smth later
//just don't want this numbers coupled w/ anything
const HUMAN = "63506279";
const MISTRESS = "3168258306";

const _ = require("lodash");
const Twit = require("twit");

const accounts = _(require("./data/accounts.json"))
    .map(acct => {
        acct.T = new Twit(acct.credentials);

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

//--- processing
const unat = word =>
    word[0] == "@" ? word.slice(1) : word;

const parseMakeVerb = word => {
    switch(word) {
        "fav":
        "like":
            return "fav";
        "unfav":
        "unlike":
            return "unfav";
        "follow":
            return "follow";
        "unfollow":
            return "unfollow";
        "retweet":
        "rt":
            return "retweet";
        "unretweet":
        "unrt":
            return "unretweet";
        "tweet":
        "post":
        "say":
            return "tweet";
        "delete":
        "remove":
            return "delete";
        default:
            return null;
    }
};

//PROTIP this depends on accounts et al
//returns the id of the api account we want
const parseActor = word => {
    word = unat(word);

    //it's an id already
    if(accounts[word])
        return word;
    //it's a screen_name
    else if(_.has(accounts, acct => word == acct.screen_name))
        return _.find(accounts, (acct, key) => acct.screen_name == word && key);
    //human alias
    else if(_.has(human.alias, word))
        return HUMAN;
    //bot alias
    else if(_.has(mistress.alias, word))
        return MISTRESS;
    //no dice
    else
        return null;
};

//returns an obj to merge with other api options
const parseTarget = word => {
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

        let index = _.findIndex(words, word => word.match(/please/));
        let parsed = index > -1 && msg._cmd(words.slice(index + 1));

        //TODO if(!parsed) msg._convo()
        return parsed;
    },
    _cmd: words => {
        switch(words[0]) {
            //"make alice follow bob", eg
            "make":
                let actor = parseActor(words[1]);
                let verb = parseMakeVerb(words[2]);
                let target = verb == "tweet" ? words.slice(3)
                    : parseTarget(words[3]);

                if(actor && verb && target)
                    console.log(`actor: ${actor}\nverb: ${verb}\ntarget: ${target}`);
                    return [actor, verb, target];
                else
                    return null;
            //"remind":
            default:
                return null;
        }
    }
};


//--- streaming
const stream = mistress.T.stream("user");

stream.on("tweet", tweet => {
    //only handle tweets by me and that are not retweets
    if(!(tweet.user.id_str == HUMAN && !tweet.retweeted_status))
        return;

    console.log(`@${tweet.screen_name}: ${tweet.status}`);

    let parsed = msg.parse(tweet.status);

});

//stream.on("tweet", tweet => {
//});
