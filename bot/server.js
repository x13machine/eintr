global.crypto = require('crypto');
global.fs = require('fs');
global.cj = require('comment-json');
global.feed = require('simple-feedreader');
global.jimp = require('jimp');
global.unfluff = require('unfluff');
global.getUrls = require('get-urls');

global.stack = new (require('stackexchange-node'))({site:'skeptics'});
global.request = require("request");
global.redisLib = require("redis");


global.config = cj.parse(fs.readFileSync('config.json'), null, true);
global.sources = cj.parse(fs.readFileSync('sources.json'), null, true);

if(process.env.config){
	var ec = config.override[process.env.config];
	for(var i in ec){
		config[i] = ec[i];
	}
}

global.pg = require('pg');
global.sql = new pg.Pool(config.pg);

global.redis = redisLib.createClient(config.redis);

require('./functions.js');
require('./articles.js');
require('./stack.js');
require('./coins.js');

function apnews(item){
	var urls = Array.from(getUrls(item.description));
	for(var i in urls){
		var url = urls[i];
		var test = 'http://analytics.apnewsregistry.com/analytics/V2/Image.svc/AP/E/prod/PC/Basic/RWS/hosted2.ap.org/CAI/'
		if(url.substr(0,test.length) == test){
			return 'https://apnews.com/' + url.split('/')[14] + '/' + item.title.Replace(' ','-');
		}
	}
}

for(var slug in sources){
	var source = sources[slug];
	function grab(source,slug){
		var articles = {};
		
		function done(){
			console.log('done', slug);
			sql.query('SELECT "hash" FROM "articles" WHERE "hash" = ANY($1::text[])',[Object.keys(articles).concat([''])], function (err, res) {
				if(err){
					console.log(err);
					res.rows = [];
				}
				
				res.rows.forEach(function(row){
					delete articles[row.hash];
				});
				
				getArticle(articles,0,function(){
					setTimeout(function(){
						grab(source,slug)	
					},config.interval * 1000);
				});
			})
			
		}
		
		function rss(z){
			if(z === source.rss.length){
				done();
				return ;
			}
			
			console.log(slug,z)
			feed(source.rss[z], function(err, items) {
				if(err){
					console.log(slug,source.rss[z],err);
					return ;
				}

				items.forEach(function(item,i){
					if(!item.guid){
						return;
					}
					/*
					if(slug == 'apnews'){
						item.link = apnews(item) || item.link;
						item.guid = item.link;
					}*/
					
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

				
				setTimeout(function(){
					rss(z + 1)
				},config.delay);
			});
		}
		rss(0);
	}
	grab(source,slug);
}
