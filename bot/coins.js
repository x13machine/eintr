function gra(){
	getJson('https://api.coinmarketcap.com/v1/ticker/',function(coins,err){
		setTimeout(gra,config.coinInterval * 1000);
		if(!coins)return ;
		coins = coins.filter(function(coin){
			return 1 <= coin.price_usd
		});
		
		coins = coins.splice(0, 10);
		
		var info = [];
		var download = [];
		coins.forEach(function(coin){
			download.push(coin.id);
			info.push({
				name: coin.name,
				price: coin.price_usd,
				change: coin.percent_change_24h * 1, 
				id: coin.id.Replace('.','')
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
					jimp.read('https://files.coinmarketcap.com/static/img/coins/32x32/' + dat + '.png', function (err, image) {
						if(err || !image)return;
						try{
							image.resize(16, 16).write(config.coins + '/' + dat + '.png');
						}catch(err){console.log(err)}
					});
				});
			}
		});
	});
}

gra();
