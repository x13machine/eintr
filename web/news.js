const models = require('../shared/models');

global.sources = {};
global.sourcesArray = [];

var sourcesChecked = false;
function getSources(){
	models.sources.findAll({
		where: {
			inuse: true
		},
		order:[
			['type', 'ASC'],
			['name', 'ASC']
		]
	}).then(rows => {
		sourcesArray = Array.from(rows);
		for(var i in rows){
			sources[rows[i].slug] = rows[i];
		}
		
		if(!sourcesChecked){
			getArticles();
			sourcesChecked = true;
		}
	}).catch(err => console.log('sources', err));
	
	setTimeout(getSources,config.sourceUpdate);
}

getSources();

var cats = [
	'news',
	'factcheck'
];

var sorts = {
	'latest': '"articles"."published"',
	'trending': '(SELECT POWER((SELECT COUNT(*) FROM "votes" WHERE "vote" = true AND "articles"."ID" = "votes"."article") + 2, coalesce(avg("vote"::int),0.5)) FROM "votes" WHERE "article" = "articles"."ID") / (extract(\'epoch\' from CURRENT_TIMESTAMP)::bigint - "published")'
};

var arts = {};
var artsID = {};
var lookup = {};

function grabArticles(cat,sort){
	models.sequelize.query('SELECT \
		"articles"."ID", \
		"articles"."title", \
		"articles"."description", \
		"articles"."url", \
		"articles"."published", \
		"articles"."image", \
		"articles"."slug", \
		"images"."use", \
		(SELECT  coalesce(avg("vote"::int),0.5) FROM "votes" WHERE "article" = "articles"."ID") as "percent" FROM "articles" \
		LEFT JOIN "sources" ON "sources"."slug" = "articles"."slug" LEFT JOIN "images" ON "images"."ID" = "articles"."image" \
		WHERE "sources"."type"= ?::text ORDER BY ' + sorts[sort] + ' DESC LIMIT ?',{
		replacements: [cat, config.maxArticles],
		type: models.sequelize.QueryTypes.SELECT
	}).then(rows => {
		var ids = [];
		articles = [];
		var lo = {};
		rows.forEach(row => {
			var source = sources[row.slug];
			ids.push(row.ID);
			var meta = {
				id: row.ID,
				title: decodeHTML(row.title),
				link: row.url,
				source: source.name,
				site: source.link,
				image: row.use ? row.image : null,
				date: new Date(row.published * 1000),
				percent: Math.round(row.percent * 100),
				summary: summary(decodeHTML(row.description),512)
			};
			
			lo[row.ID] = meta;
			articles.push(meta);
		});
		var slug = cat + '_' + sort;
		artsID[slug] = ids;
		lookup[slug] = lo;
		arts[slug] = articles;
	}).catch(console.log);
}

function getArticles(){
	cats.forEach(cat => {
		for(var i in sorts){
			grabArticles(cat,i);
		}
	});
	setTimeout(getArticles,config.articleUpdate);
}


global.getNews = (options, callback) => {
	if(cats.indexOf(options.type) === -1)options.type = 'news';
	if(!sorts[options.sort])options.sort = 'trending';
	options.page = options.page - 1 || 0;
	
	if(options.q){
		searchNews(options, (err, data) => {
			var ids = [];
			if(err){
				callback([],options);
				return ;
			}
			
			data.forEach(article => {
				ids.push(article.ID);
			});
			
			options.sort = 'search';
			ret(data, ids);
		});
		return ;
	}
	
	var slug = options.type + '_' + options.sort;
	var start = config.pageSize * options.page;
	var articles = arts[slug].slice(start, start + config.pageSize);
	if(!options.id){
		callback(articles,options);
		return ;
	}
	
	ret(articles,artsID[slug].slice(start, start + config.pageSize));
	
	function ret(articles,list){
		if(!options.id){
			callback(articles,options);
			return ;
		}

		models.votes.findAll({
			attributes: ['vote','article'],
			where: {
				article: list,
				user: options.id
			},
		}).then(rows => {
			rows.forEach(row => {
				articles.every((article,i) => {
					if(row.article == article.id){
						articles[i].vote = {
							false: 'down',
							true: 'up',
						}[row.vote];
						return false;
					}
					return true;
				});
			});
			
			
			callback(articles,options);
		}).catch(err => {
			console.log(err);
			callback(articles,options);
		});
	}
};


global.searchNews = (options, callback) => {
	if(cats.indexOf(options.type) === -1)options.type = 'news';
	options.page = options.page || 0;
	models.sequelize.query('SELECT \
		"articles"."ID", \
		"articles"."title", \
		"articles"."description", \
		"articles"."url", \
		"articles"."published", \
		"articles"."image", \
		"articles"."slug", \
		"images"."use", \
		(SELECT coalesce(avg("vote"::int),0.5) FROM "votes" WHERE "article" = "articles"."ID") as "percent" FROM "articles" \
		LEFT JOIN "sources" ON "sources"."slug" = "articles"."slug" LEFT JOIN "images" ON "images"."ID" = "articles"."image" \
		WHERE (to_tsvector(\'english\',"articles"."content") @@ (?)) AND "sources"."type" = (?)::text \
		ORDER BY "articles"."published" DESC LIMIT (?)::int OFFSET (?)::int',{
		replacements: [
			options.q,
			options.type,
			config.pageSize,
			options.page * config.pageSize
		],
		type: models.sequelize.QueryTypes.SELECT
	}).then(rows => {
		var articles = [];
		rows.forEach(row => {
			var source = sources[row.slug];
			var meta = {
				id: row.ID,
				title: decodeHTML(row.title),
				link: row.url,
				source: source.name,
				site: source.link,
				image: row.use ? row.image : null,
				date: new Date(row.published * 1000),
				percent: Math.round(row.percent * 100),
				summary: summary(decodeHTML(row.description),512)
			};
			
			articles.push(meta);
		});
		callback(null, articles);
	}).catch(err => {
		console.log('search',err);
		callback(null, []);
	});
		
};
