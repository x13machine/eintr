
String.prototype.Replace = function(a,b){
	return this.split(a || ',').join(b || '');
}

handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

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
});

global.decodeHTML = function(str){
	return htmlToText.fromString(str,{
		wordwrap: null,
		ignoreHref: true,
		ignoreImage: true
	}).Replace('&apos;','\'').Replace('&quot;','"').Replace('&amp;','&');
}

global.comma = function(x){
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

global.round = function(x){
	return Math.round(x * 100) / 100	
}

global.base = function(str){
	return str.Replace('+','-').Replace('/','_').Replace('=').substr(0,15);
}

String.prototype.removeWhiteSpace = function(){
	var str = this;
	while(1){
		var last = str;
		var str = str.Replace('  ',' ');
		if(last === str)return str;
	}
}

global.summary = function(str,max){
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
}

global.summary2 = function(str,max){
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
}

global.json = function(str){
	try{
		return JSON.parse(str);
	}catch(err){
		return null;
	}
}
