var sidebar = require('./sidebar');
var cache = require('./cache');

app.use((req, res, next) => {
	function getFiles(list, type){
		var compiled = [];
		list.forEach(name => {
			compiled.push(cache.lookups[name + '.' + type]);
		});
		return compiled;
	}

	
	res.renderPage = (page, opt) => {
		res.render(page, Object.assign({
			name: req.session.passport ? req.session.passport.user.name : null,
			logined: !!req.user,
			page: page,
			csrfToken: req.csrfToken(),
			js: getFiles(config.media[page].js.concat(config.media.layout.js),'js'),
			css: getFiles(config.media[page].css.concat(config.media.layout.css),'css')
		}, sidebar, opt));
	};
	
	next();
});

app.get('/', (req, res) => {
	getNews({
		id: req.user,
		type: req.query['type'],
		sort: req.query['sort'],
		page: req.query['page'],
		q: req.query['q']
	}, (articles,data,err) => {
		if(err){
			res.end('error');
			return ;
		}
		res.renderPage('index', {
			sort: data.sort,
			type: data.type,
			search: data.q,
			articles: articles
		});
	});
});

app.get('/about', (req, res) => {
	res.renderPage('about', {
		sources: sourcesArray
	});
});