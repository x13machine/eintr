String.prototype.Replace = function(a,b){
	return this.split(a || ' ').join(b || '');
};

String.prototype.removeWhiteSpace = function(){
	var str = this;
	var last = '';
	while(last !== str){
		last = str;
		str = str.Replace('  ',' ');
	}
	return str;
};

Number.prototype.comma = function() {
	return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

global.round = function(x){
	return Math.round(x * 100) / 100;	
};

String.prototype.ascii = function(){
	return this.replace(/[^ -~]/g, '');
};

global.removeGarbage = function(str){
	return str.removeWhiteSpace();
};

global.base = function(str){
	return str.Replace('+','-').Replace('/','_').Replace('=').substr(0,15);
};

global.timestamp = function(time){
	return  ~~(+new Date(time === undefined ? new Date() : time)/ 1000);
};

global.getJson = function(url,callback){
	request(url, function (err, res, body) {
		try{
			if(err || res.statusCode !== 200){
				setImmediate(function(){
					callback(null, err);
				});
				return ;
			}
			var json = JSON.parse(body);
			setImmediate(function(){
				callback(json);
			});
		}catch(err){
			callback(null ,err);
		}
	});
};


