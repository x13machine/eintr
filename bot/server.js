global.crypto = require('crypto');
global.fs = require('fs');
global.feed = require('simple-feedreader');
global.jimp = require('jimp');
global.unfluff = require('unfluff');
global.getUrls = require('get-urls');

global.stack = new (require('stackexchange-node'))({site:'skeptics'});
global.request = require('request');
global.redisLib = require('redis');


global.config = require('./config.json');
global.sources = require('./sources.json');

if(process.env.override)config = Object.assign(config, JSON.parse(process.env.override));
if(process.env.config)config = Object.assign(config, config.override[process.env.config]);

global.redis = redisLib.createClient(config.redis);

const models = require('../shared/models');

require('./functions.js');
require('./articles.js');
require('./stack.js');
require('./coins.js');

function grab(source,slug){
	var articles = {};
	
	function done(){
		console.log('done', slug);

		function articlesLoop(){
			getArticle(articles,0,() => {
				setTimeout(() => {
					grab(source,slug);	
				},config.interval * 1000);
			});
		}
		models.articles.findAll({
			attributes : ['hash'],
			where: {
				hash: {
					[models.op.any]: Object.keys(articles).concat([''])
				}
			}
		}).then(rows => {
			rows.forEach(row => {
				delete articles[row.hash];
			});
			
			articlesLoop();
		}).catch(err => {
			console.log(err);
			articlesLoop();
		});
		
	}
	
	function rss(z){
		if(z === source.rss.length){
			done();
			return ;
		}
		
		console.log(slug,z);
		feed(source.rss[z], (err, items) => {
			if(err){
				console.log(slug,source.rss[z],err);
				return ;
			}

			items.forEach((item) => {
				if(!item.guid){
					return;
				}
				
				var id = crypto.createHash('sha256').update(source.question ? item.guid.split('?')[0] : item.guid, 'utf8').digest('base64');
				if(!item.title || !item.description){
					return ;
				}
				

				var time = timestamp();

				item.date = item.date || item.pubDate;
				
				articles[id] = {
					slug: slug,
					id: id,
					title: removeGarbage(item.title),
					link: item.link,
					published: Math.min(time, item.data === null ? time : timestamp(item.date)),
					description: removeGarbage(item.summary || item.description)
				};
				
				var enc = item.enclosures[0] || {type: ''};
				articles[id].image = item.image.url || (enc.type.split('/')[0] === 'image' ? enc.url : undefined);
			});

			
			setTimeout(() => {
				rss(z + 1);
			},config.delay);
		});
	}
	rss(0);
}

for(var slug in sources){
	var source = sources[slug];

	grab(source,slug);
}
