const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const csrf = require('csurf');
const models = require('../shared/models');


app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((obj, done) => {
	done(null, obj);
});

passport.use(new GoogleStrategy(config.google, (token, tokenSecret, profile, done) => {
	var displayName = profile.displayName.substr(0,60); //make sure it fits into database.
	var email = profile.emails[0].value;
	models.users.upsert({
		email: email,
		google: profile.id,
		name: displayName
	},{
		where: {
			google: profile.id
		}
	}).then(() => {
		models.users.findAll({
			attributes : ['ID'],
			where: {
				email: email
			}
		}).then(rows => {
			if(!rows[0]){
				done('row not round',null);
				return ;
			}

			done(null, {
				id: rows[0].ID,
				name: displayName
			});
		}).catch(err => {
			console.log('r',err);
		});
	}).catch(err => {
		console.log('l', err);
		done(err, null);
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
app.use(csrf({ cookie: false }));

app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

app.get('/auth/google/callback',passport.authenticate('google', {
	successRedirect : '/',
	failureRedirect : '/'
}));

app.use('*', (req, res, next) => {
	req.user = null;
	if(req.session.passport)req.user = req.session.passport.user.id;
	next();
});	

app.post('/logout', (req,res) => {
	req.session.destroy(() => res.redirect('/'));
});