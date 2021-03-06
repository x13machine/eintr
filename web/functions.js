const htmlToText = require('html-to-text');

String.prototype.Replace = function(a,b) {
	return this.split(a || ',').join(b || '');
};

global.ifCond = (v1, operator, v2, options) => {

	switch (operator) {
	case '==':
		return (v1 == v2) ? options.fn(this) : options.inverse(this);
	case '===':
		return (v1 === v2) ? options.fn(this) : options.inverse(this);
	case '!=':
		return (v1 != v2) ? options.fn(this) : options.inverse(this);
	case '!==':
		return (v1 !== v2) ? options.fn(this) : options.inverse(this);
	case '<':
		return (v1 < v2) ? options.fn(this) : options.inverse(this);
	case '<=':
		return (v1 <= v2) ? options.fn(this) : options.inverse(this);
	case '>':
		return (v1 > v2) ? options.fn(this) : options.inverse(this);
	case '>=':
		return (v1 >= v2) ? options.fn(this) : options.inverse(this);
	case '&&':
		return (v1 && v2) ? options.fn(this) : options.inverse(this);
	case '||':
		return (v1 || v2) ? options.fn(this) : options.inverse(this);
	default:
		return options.inverse(this);
	}
};

global.decodeHTML = str => {
	return htmlToText.fromString(str,{
		wordwrap: null,
		ignoreHref: true,
		ignoreImage: true
	}).Replace('&apos;','\'').Replace('&quot;','"').Replace('&amp;','&');
};

global.comma = x => {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

global.round = x => {
	return Math.round(x * 100) / 100;	
};

global.base = str => {
	return str.Replace('+','-').Replace('/','_').Replace('=').substr(0,15);
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

global.summary = (str,max) => {
	var sum = [];
	var len = 0;
	var parts = str.Replace('\n',' ').split(' ');
	for(var i in parts){
		var word = parts[i];
		if(max < word.length + len + sum.length - 1)break;
		len += word.length;
		sum.push(word);
	}
	return sum.join(' ');
};

global.summary2 = (str,max) => {
	var sum = [];
	var len = 0;
	var parts = ss.split(str);
	var sen = '';
	for(var i in parts){
		var part = parts[i];
		if(part.type !== 'Sentence')continue ;
		sen = part.value.trim();
		if(max < sen.length + len + sum.length - 1)break;
		len += sen.length;
		sum.push(sen);
	}
	if(sum.length == 0)return sen.substr(0,max - 3) + '...';
	return sum.join(' ');
};

global.json = str => {
	try{
		return JSON.parse(str);
	}catch(err){
		return null;
	}
};
