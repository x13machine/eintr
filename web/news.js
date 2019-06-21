//'SELECT "articles"."ID","articles"."title", "articles"."description","articles"."url","articles"."published","articles"."image","articles"."slug","images"."use","sources"."name","sources"."link", "votes"."vote","articles"."percent" FROM "articles" LEFT JOIN "votes" ON "votes"."article" = "articles"."ID" AND "user" = $1::int LEFT JOIN "sources" ON "sources"."slug" = "articles"."slug" LEFT JOIN "images" ON "images"."ID" = "articles"."image" WHERE "sources"."type"= $2::text ORDER BY ' + sor + ' DESC LIMIT $3::int OFFSET $4::int'

//(SELECT  coalesce(avg("vote"::int),0.5) as "percent" FROM "votes" WHERE "article" = "articles"."ID") as 

global.sources = {};
global.sourcesArray = [];

function getSources(){
	sql.query('SELECT * FROM "sources" WHERE "inuse" ORDER BY "type", "name"',function(err,res){
		if(err)return;
		sourcesArray = Array.from(res.rows);
		for(var i in res.rows){
			sources[res.rows[i].slug] = res.rows[i];
		}
	});
	
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
	sql.query('SELECT "articles"."ID","articles"."title", "articles"."description","articles"."url","articles"."published","articles"."image","articles"."slug","images"."use",(SELECT  coalesce(avg("vote"::int),0.5) FROM "votes" WHERE "article" = "articles"."ID") as "percent" FROM "articles" LEFT JOIN "sources" ON "sources"."slug" = "articles"."slug" LEFT JOIN "images" ON "images"."ID" = "articles"."image" WHERE "sources"."type"= $1::text ORDER BY ' + sorts[sort] + ' DESC LIMIT $2',[
		cat,
		config.maxArticles,
	], function (err, res) {
		if(err){
			console.log(err);
			return ;
		}
		
		var ids = [];
		articles = [];
		var lo = {};
		res.rows.forEach(function(row){
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
	});
}

function getArticles(){
	cats.forEach(function(cat){
		for(var i in sorts){
			grabArticles(cat,i);
		}
	});
	setTimeout(getArticles,config.articleUpdate);
}

getArticles();

global.getNews = function(options, callback){
	if(cats.indexOf(options.type) === -1)options.type = 'news';
	if(!sorts[options.sort])options.sort = 'trending';
	options.page = options.page - 1 || 0;
	
	if(options.q){
		searchNews(options,function(err, data){
			var ids = [];
			if(err){
				callback([],options);
				return ;
			}
			
			data.forEach(function(article){
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
		sql.query('SELECT "vote", "article" FROM "votes" WHERE "article" = ANY($1::int[]) AND "user" = $2::int', [
			list,
			options.id
		], function (err, res) {
			if(!err){
				res.rows.forEach(function(row){
					articles.every(function(article,i){
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
			}else{
				console.log(err);
			}
			
			callback(articles,options);
		});
	}
};


global.searchNews = function(options, callback){
	if(cats.indexOf(options.type) === -1)options.type = 'news';
	options.page = options.page || 0;
	sql.query('SELECT "articles"."ID","articles"."title", "articles"."description","articles"."url","articles"."published","articles"."image","articles"."slug","images"."use",(SELECT  coalesce(avg("vote"::int),0.5) FROM "votes" WHERE "article" = "articles"."ID") as "percent" FROM "articles" LEFT JOIN "sources" ON "sources"."slug" = "articles"."slug" LEFT JOIN "images" ON "images"."ID" = "articles"."image" WHERE (to_tsvector(\'english\',"articles"."content") @@ $1) AND "sources"."type" = $2::text ORDER BY "articles"."published" DESC LIMIT $3::int OFFSET $4::int',[
		options.q,
		options.type,
		config.pageSize,
		options.page * config.pageSize
	], function (err,res){
		if(err){
			console.log(err);
			callback(null, []);
			return ;
		}
		
		var articles = [];
		res.rows.forEach(function(row){
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
	});
		
};
