function insert(article, image){
	sql.query('INSERT INTO "articles" ("hash", "slug","url","image", "published", "title", "description","content") VALUES ($1::text,$2::text,$3::text,$4::int,$5::int,$6::text,$7::text,$8::text) ON CONFLICT ("hash") DO NOTHING RETURNING "ID"',[
		article.id,
		article.slug,
		article.link,
		image,
		article.published,
		article.title,
		article.description,
		article.content
	],function(err,res){
		console.log(err,article.link);
	});	
}


global.getArticle = function(articles,index,callback){
	var article = articles[Object.keys(articles)[index]];
	if(!article){
		callback();
		return ;
	}
	
	function next(){
		setTimeout(function(){
			getArticle(articles,index + 1,callback);
		}, config.delay);
	}
	
	function getImage(callback){
		if(!article.image || sources[article.slug].noimg){
			callback(null);
			return;
		}
		
		var sha = crypto.createHash('sha256').update(article.image).digest('base64');
		sql.query('SELECT "ID" FROM "articles" WHERE "url" = $1::text',[sha],function(err ,res){
			if(res.rows.length === 1){
				callback(row.ID)
				return ;
			}
			
			setTimeout(function(){
				jimp.read(article.image, function (err, image) {
					if(err || !image){
						callback(null);
						return;
					}
					
					var img = image.scaleToFit(config.size , config.size).quality(100)
					img.getBuffer('image/jpeg', function(err,buff){
						var hash = crypto.createHash('sha256').update(buff).digest('base64');
						sql.query('SELECT "ID" FROM "images" WHERE "hash" = $1::text',[
							hash
						],function(err,res){
							if(err){
								console.log(err);
								callback(null);
								return ;
							}
							
							if(res.rows[0]){
								callback(res.rows[0].ID)
								return ;
							}
							
							sql.query('INSERT INTO "images" ("url","hash") VALUES ($1,$2) RETURNING "ID"',[
								sha,
								crypto.createHash('sha256').update(buff).digest('base64')
							],function(err,res){
								if(err || !res.rows[0]){
									//console.log(err)
									callback(null)
									return ;
								}
								var id = res.rows[0].ID;
								
								img.write(config.save + '/' + id + '.jpg');
								callback(id);
							});
						});
					});
					
				});
			}, config.delay);
		});
	}
	
	request(article.link, function (err, res, body) {
		if(err || res.statusCode !== 200){
			next();
			return ;
		}
		
		var data = unfluff(body);
		article.content = data.text.ascii();
		article.image = data.image || article.image;
		article.content = article.description.length < article.content.length ? article.content : article.description;
		
		getImage(function(image){
			insert(article, image);
			next();
		});
	});
	

}
