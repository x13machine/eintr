app.get('/ajax/vote', function(req, res){
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify({logined: !!req.user}));
	if(!req.user)return ;
	
	var article = req.query['article'] || '';
	var side = req.query['side'] || '';
	if(req.headers.referer.split('/')[2] !== req.headers.host || !Number.isInteger(article * 1))return;

	
	if(side === 'none'){
		sql.query('DELETE FROM "votes" WHERE "article" = $1::int AND "user" = $2::int',[
			article,
			req.user
		],function(){});
		return ;
	}

	sql.query('INSERT INTO "votes" ("article", "user","vote") VALUES ($1::int, $2::int, $3::boolean) ON CONFLICT ("user","article") DO UPDATE SET "vote" = $4::boolean',[
		article,
		req.user,
		side === 'up',
		side === 'up'
	],function(){});
});

app.get('/ajax/news', function(req, res){
	getNews({
		id: req.user,
		type: req.query['type'],
		page: req.query['page'],
		sort: req.query['sort'],
		q: req.query['q']
	},function(articles, data, err){
		res.setHeader('Content-Type', 'application/json');
		if(err){
			res.end(JSON.stringify([]));
			return ;
		}
		res.end(JSON.stringify(articles));
	});

});


app.get('/ajax/search', function(req, res){
	searchNews({
		type: req.query['type'],
		page: req.query['page'],
		sort: req.query['sort'],
		q: req.query['q']
	},function(err, data){
		res.setHeader('Content-Type', 'application/json');
		if(err){
			res.end(JSON.stringify([]));
			return ;
		}
		
		res.end(JSON.stringify(data.splice(0,100)));
	});

});


app.get('/test', function(req, res){
	res.end('hello world');
});
