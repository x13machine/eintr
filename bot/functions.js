String.prototype.Replace = function (a,b) {
	return this.split(a || ' ').join(b || '');
};

String.prototype.removeWhiteSpace = function() {
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

global.round = (x) => {
	return Math.round(x * 100) / 100;	
};

String.prototype.ascii = function() {
	return this.replace(/[^ -~]/g, '');
};

global.removeGarbage = str => {
	return str.removeWhiteSpace();
};

global.base = str => {
	return str.Replace('+','-').Replace('/','_').Replace('=').substr(0,15);
};

global.timestamp = time => {
	return  ~~(+new Date(time === undefined ? new Date() : time)/ 1000);
};

global.getJson = (url,callback) => {
	request(url, (err, res, body) => {
		try{
			if(err || res.statusCode !== 200){
				setImmediate(() => {
					callback(null, err);
				});
				return ;
			}
			var json = JSON.parse(body);
			setImmediate(() => {
				callback(json);
			});
		}catch(err){
			callback(null ,err);
		}
	});
};


