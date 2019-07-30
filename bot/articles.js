const models = require('../shared/models');


global.getArticle = (articles,index,callback) => {
	var article = articles[Object.keys(articles)[index]];
	if(!article){
		callback();
		return ;
	}
	
	function next(){
		setTimeout(() => {
			getArticle(articles,index + 1,callback);
		}, config.delay);
	}

	function createImage(sha, callback){
		setTimeout(() => {
			jimp.read(article.image, (err, image) => {
				if(err || !image){
					callback(null);
					return;
				}
				
				var img = image.scaleToFit(config.size , config.size).quality(100);
				img.getBuffer('image/jpeg', (err, buff) => {
					var hash = crypto.createHash('sha256').update(buff).digest('base64');

					models.articles.findAll({
						attributes: ['ID'],
						where: {
							hash: hash
						}
					}).then(rows => {
						if(rows[0]){
							callback(rows[0].ID);
							return ;
						}

						models.images.create({
							url: sha,
							hash:  crypto.createHash('sha256').update(buff).digest('base64')
						}).then((image) => {
							img.write(config.save + '/' + image.ID + '.jpg');
							callback(image.ID);
						}).catch(() => callback(null));
					}).catch(err =>{	
						console.log(err);
						callback(null);
					});
				});
				
			});
		}, config.delay);

	}
	
	function getImage(callback){
		if(!article.image || sources[article.slug].noimg){
			callback(null);
			return;
		}
		
		var sha = crypto.createHash('sha256').update(article.image).digest('base64');
		models.images.findAll({
			attributes: ['ID'],
			where: {
				url: sha
			}
		}).then(rows =>{
			if(rows.length === 1){
				callback(rows[0].ID);
				return ;
			}

			createImage(sha, callback);
		}).catch(() => {
			createImage(sha, callback);
		});
	}
	
	request(article.link, (err, res, body) => {
		if(err || res.statusCode !== 200){
			next();
			return ;
		}
		
		var data = unfluff(body);
		article.content = data.text.ascii();
		article.image = data.image || article.image;
		article.content = article.description.length < article.content.length ? article.content : article.description;
		
		getImage(image => {
			models.articles.create({
				hash: article.id,
				slug: article.slug,
				url: article.link,
				image: image,
				published: article.published,
				title: article.title,
				description: article.description,
				content: article.content
			}).then(() =>{
				console.log(article.link);
			}).catch(err=> {
				console.log(err, article.link);
			});

			next();
		});
	});
	

};
