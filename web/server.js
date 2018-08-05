global.crypto = require('crypto');
global.fsmonitor = require('fsmonitor');
global.fs = require('fs');
global.config = JSON.parse(fs.readFileSync('config.json'));
if(process.env.config){
	var ec = config.override[process.env.config];
	for(var i in ec){
		config[i] = ec[i];
	}
}

process.env.NODE_ENV = 'production';

global.htmlToText = require('html-to-text');

global.redisLib = require("redis");
global.redis = redisLib.createClient(config.redis);

global.pg = require('pg');
global.sql = new pg.Pool(config.pg);

global.handlebars = require('handlebars');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

require('./functions.js');
require('./news.js');
global.express = require('express');

global.app = express();
app.enable('trust proxy');
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

passport.use(new GoogleStrategy(config.google,
	function(token, tokenSecret, profile, done) {
		var avatar = profile._json.image.url.split('?')[0] + '?sz=';
		var displayName = profile.displayName.substr(0,60); //make sure it fits into database.
		var email = profile.emails[0].value;

		var query = sql.query('INSERT INTO "users" ("email","google", "name") VALUES ($1::text, $2::text, $3::text) ON CONFLICT ("email") DO UPDATE SET "name" = $3::text',[
			email,
			profile.id,
			displayName
		], function (err) {
			sql.query('SELECT "ID" FROM "users" WHERE "email" = $1::text', [email], function (err, res) {
				var e = err || !res.rows[0]
				if(e){
					done(e,null);
					return ;
				}
				
				done(null, {
					id: res.rows[0].ID
				});
			});

		});
	}
));

var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var sessionMiddleware = session({
    store: new RedisStore({
		client: redis
	}),
	resave: true,
	saveUninitialized: false,
    secret: config.secret,
    cookie: {
		maxAge: config.expire * 1000
	}
});
app.use(sessionMiddleware);

app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

app.get('/auth/google/callback',passport.authenticate('google', {
	successRedirect : '/',
	failureRedirect : '/'
}));

app.get('/logout',function(req,res){
	req.session.destroy(function (err) {
		res.redirect('/');
	});
});

app.get('*', function (req, res, next) {
	req.user = null;
	if(req.session.passport)req.user = req.session.passport.user.id;
	next();
});	

require('./cache.js');
require('./templates.js');
require('./data.js');
require('./pages.js');
require('./ajax.js');
app.use(express.static('public'));
global.server = app.listen(process.env.PORT || config.port || 5555);

process.on('uncaughtException', function(err) {
	console.log(err);
});