app.get('/', function(req, res){
	getNews({
		id: req.user,
		type: req.query['type'],
		sort: req.query['sort'],
		page: req.query['page'],
		q: req.query['q']
	},function(articles,data,err){
		if(err){
			res.end('error');
			return ;
		}
		render(req, res,'index', {
			sort: data.sort,
			type: data.type,
			search: data.q,
			articles: articles
		});
	});
});

app.get('/about', function(req, res){
		
	render(req, res,'about', {
		sources: sourcesArray
	});
});


app.get('/sidebar', function(req, res){
		
	render(req, res,'none', {});
});
