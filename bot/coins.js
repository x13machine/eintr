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
		var info = [];				
		res.data.forEach(coin => {
			
			info.push({
				id: coin.slug,
				uid: coin.id,
				name: coin.name,
				change: coin.quote.USD.percent_change_24h.toFixed(2),
				price: coin.quote.USD.price
			});
		});

		redis.set('coins', JSON.stringify(info));
		
	}).catch(err =>{
		console.log('coins',err);
	});
	setTimeout(gra,config.coinInterval * 1000);
}

gra();
