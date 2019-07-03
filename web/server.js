global.config = require('./config.json');

const bodyParser = require('body-parser');

if(process.env.override)config = Object.assign(config, JSON.parse(process.env.override));
if(process.env.config)config = Object.assign(config, config.override[process.env.config]);


process.env.NODE_ENV = 'production';

const redisLib = require('redis');
global.redis = redisLib.createClient(config.redis);

require('./functions.js');
require('./news.js');
global.express = require('express');

global.app = express();
app.enable('trust proxy');

app.engine('handlebars', require('express-handlebars')({
	defaultLayout: 'main',
	helpers: {
		ifCond: ifCond
	}
}));

app.set('view engine', 'handlebars');
app.set('views', 'web/views');

app.use(bodyParser.urlencoded({ extended: false }));

require('./login.js');
require('./cache.js');
require('./pages.js');
require('./ajax.js');
app.use(express.static(__dirname + '/public'));
app.listen(process.env.PORT || config.port || 5555);

process.on('uncaughtException', console.log);
