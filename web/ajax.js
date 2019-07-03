const models = require('../shared/models');


app.post('/ajax/vote', (req, res) => {
	res.json({logined: !!req.user});
	var article = req.body['article'] || '';
	var side = req.body['side'] || '';
	if(!req.user || !Number.isInteger(article * 1))return;
	if(side === 'none'){
		models.votes.destroy({
			where: {
				article: article,
				user: req.user
			}
		});
	}else{
		models.votes.upsert({
			article: article,
			user: req.user,
			vote: side === 'up'
		},{
			where: {
				article: article,
				user: req.user
			}
		});
	}
});

app.post('/ajax/news', (req, res) => {
	getNews({
		id: req.user,
		type: req.body['type'],
		page: req.body['page'],
		sort: req.body['sort'],
		q: req.body['q']
	},(articles, data, err) => {
		res.json(err ? [] : articles);
	});

});


app.post('/ajax/search', (req, res) => {
	searchNews({
		type: req.body['type'],
		page: req.body['page'],
		sort: req.body['sort'],
		q: req.body['q']
	},(err, data) => {
		res.json(err ? [] : data.splice(0,100));
	});

});