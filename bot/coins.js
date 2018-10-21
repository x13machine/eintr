const rp = require('request-promise');

const requestOptions = {
	method: 'GET',
	uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
	qs: {
		start: 1,
		limit: 10,
		convert: 'USD'
	},
	headers: {
		'X-CMC_PRO_API_KEY': config.cmcAPI
	},
	json: true,
	gzip: true
};


function gra(){
	rp(requestOptions).then(res => {
		setTimeout(gra,config.coinInterval * 1000);		
		
		var info = [];
		var download = [];
		var downloadID = {};
		var info = [];
		
		res.data.forEach(coin => {
			download.push(coin.slug);
			downloadID[coin.slug] = coin.id;
			
			info.push({
				id: coin.slug,
				name: coin.name,
				change: coin.quote.USD.percent_change_24h,
				price: coin.quote.USD.price
			});
		});

		redis.set('coins', JSON.stringify(info));
		
		fs.readdir(config.coins, function(err, files) {
			if(err)return ;
			files.forEach(function(file){
				var name = file.split('.')[0];
				var index = download.indexOf(name);
				if(index > -1)download.splice(index, 1);
			});
			
			if(download.length !== 0){
				
				download.forEach(function(dat){
					jimp.read('https://s2.coinmarketcap.com/static/img/coins/16x16/' + downloadID[dat] + '.png', function (err, image) {

						if(err || !image)return;
						try{
							image.resize(16, 16).write(config.coins + '/' + dat + '.png');
						}catch(err){console.log(err)}
					});
				});
			}
		});
	}).catch((err) =>{
		console.log(err)
	});
	setTimeout(gra,config.coinInterval * 1000);
}

gra();
