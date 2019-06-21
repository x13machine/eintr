var sidebar = {};
function addZeroes( num ) {
	num = num.toString();
	var value = Number(num);
	var res = num.toString().split('.');
	if(num.indexOf('.') === -1) {
		value = value.toFixed(2);
		num = value.toString();
	} else if (res[1].length < 3) {
		value = value.toFixed(2);
		num = value.toString();
	}
	return num;
}
function build(){
	global.sidebarHTML = templates.sidebar(sidebar);
}

function getData(){

	redis.get('stack',function(err,data){
		var questions = JSON.parse(data || '[]');
		for(var i in questions){
			questions[i].title = decodeHTML(questions[i].title);
		}
		sidebar.skeptics = questions;
		build();
	});
	
	redis.get('coins',function(err,data){
		var coins = JSON.parse(data || '[]');
		var max = 0;
		coins.forEach(function(coin,i){
			coins[i].price = '$' + comma(addZeroes(round(coin.price)));
			if(0 < coin.change){
				coins[i].icon = '\u25B2 ';
				coins[i].change = addZeroes(coin.change) + '%';
				coins[i].color = '#0E0';
			}else if(coin.change < 0){
				coins[i].icon = '\u25BC ';
				coins[i].change = addZeroes(-coin.change) + '%';
				coins[i].color = '#F00';
			}else{
				coins[i].icon = '- ';
				coins[i].change = '0.00%';
			}
			max = Math.max(max, coins[i].change.length);
		});
		
		coins.forEach(function(coin,i){
			while(coin.change.length < max){
				coin.change = ' ' + coin.change;
			}
			
			coins[i].change = coin.icon + coin.change;
		});
		
		sidebar.coins = coins;
		build();
	});
	setTimeout(getData, 5000);
}

getData();
