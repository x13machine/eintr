function afrom(x){
	var arr = [];
	for(var i = 0; i < x.length; i++){
		arr.push(x[i]);
	}
	
	return arr;
}

function decodeJson(str){
	try{
		return JSON.parse(str);
	}catch(err){
		return null;
	}
}

function getJsonFromUrl() {
	var query = location.search.substr(1);
	var result = {};
	query.split('&').forEach((part) => {
		var item = part.split('=');
		result[item[0]] = decodeURIComponent(item[1]).replace(/\++/g, ' ');
	});
	return result;
}

var par = getJsonFromUrl();
$('#searchInput').value = par.q || '';

function getJson(action, obj, callback) {	
	var par = [];
	obj['_csrf'] = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
	for(var p in obj){
		if(obj[p] !== undefined)par.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
	}

	var params = par.join('&');
	
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(this.readyState != XMLHttpRequest.DONE)return ;
		this.params = params;
		(callback || (() => {}))(decodeJson(this.responseText),this);
	};
	
	xhttp.open('POST', '/ajax/' + action, true);
	xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xhttp.send(params);
}

String.prototype.encodeHTML =  function() {
	return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
};

function createChild(parent,tag){
	var child = document.createElement(tag);
	parent.appendChild(child);
	return child;
}

function $(code){
	var select = code.slice(1,code.length);
	switch(code[0]){
	case '.':
		return document.getElementsByClassName(select);
	case '#':
		return document.getElementById(select);
	default:
		return document.getElementsByTagName(code);
	}
}

function setup(){
	$('#searchType').value = $('.type')[0].id;
	afrom($('.vote')).forEach(vote => {
		vote.id = vote.getAttribute('article') + '_' + vote.getAttribute('vote');
		vote.onclick = function() {
			var vote = this;
			var side = this.getAttribute('vote');
			var article = this.getAttribute('article');
			if(vote.classList.contains('mark')){
				getJson('vote',{
					side: 'none',
					article: article
				},data => {
					if(!data.logined){
						alert('Not logined');
						return ;
					}
					vote.classList.remove('mark');
				});
				return ;
			}
			
			getJson('vote',{
				side: side,
				article: article
			},data => {
				if(!data.logined){
					alert('Not logined');
					return ;
				}				
				$('#'+ article + '_' + (side == 'up' ? 'down' : 'up')).classList.remove('mark');
				vote.classList.add('mark');
			});
			
		};
	});
}

setup();

afrom($('.types')).forEach(span => {
	function tc(){
		afrom($('.types')).forEach(span => {
			span.classList.remove('type');
		});
		
		this.classList.add('type');
		getNews();	
	}
	span.onclick = tc;
});

afrom($('.articles')).forEach(article => {
	var d = new Date(article.title);
	article.title = d.toDateString() + ', ' + d.toLocaleTimeString();
});

function addArticles(articles){

	var parent = $('#articles');
	articles.forEach(article => {
		var d = new Date(article.date);
		//table setup
		var table = createChild(parent,'table');
		table.className = 'articles';
		table.title = d.toDateString() + ', ' + d.toLocaleTimeString();
		
		var row = createChild(table,'tr');
		//voting part
		var voting = createChild(row,'td');
		function createVote(side){
			var but = createChild(voting,'div');
			but.innerHTML = side == 'up' ? '\u25B2' : '\u25BC';
			but.className = 'vote' + (side == article.vote ? ' mark' : '');
			but.setAttribute('article', article.id);
			but.setAttribute('vote', side);
		}
		

		createVote('up');
		var percent = createChild(voting,'div');
		percent.innerHTML = article.percent + '%';
		percent.className = 'percent';
		createVote('down');
		// article part
		var doc = createChild(row,'td');
		
		//headline
		var h3 = createChild(doc,'h3');
		h3.className = 'headline';
		var anchor = createChild(h3,'a');
		anchor.href = article.link;
		anchor.target = '_blank';
		anchor.innerHTML = article.title.encodeHTML();
		
		//source
		var source = createChild(doc,'p');
		source.innerHTML = 'Source: ';
		var link = createChild(source,'a');
		link.href = article.site;
		link.target = '_blank';
		link.innerHTML = article.source.encodeHTML();
	
		if(article.image){
			//thumbnail
			var thumbnail = createChild(doc,'div');
			thumbnail.className = 'thumbnail';
			var image = createChild(thumbnail,'img');
			image.src = '/thumbnail/' + article.image + '.jpg';	
		}
		//summary
		var summary = createChild(doc,'p');
		summary.className = 'summary';
		summary.innerHTML = article.summary.encodeHTML();
	});
	setup();
}
var lastPage = 1;

function getNews(){
	getJson('news',{
		sort: ($('#sort') || {}).value,
		type: $('.type')[0].id,
		q: par.q
	},(articles,req) => {
		if(req.status !== 200)return ;
		lastPage = 1;
		$('#articles').innerHTML = '';
		addArticles(articles);

		window.history.pushState(null, null, '?' + req.params);
	});	
}

if($('#sort'))$('#sort').onchange = getNews;

window.onscroll = function() {
	var d = document.documentElement;
	if(d.scrollTop + window.innerHeight < d.offsetHeight) return ;

	getJson('news',{
		type: $('.type')[0].id,
		sort: ($('#sort') || {}).value,
		q: par.q,
		page: lastPage + 1,
	},(articles,req) => {
		if(req.status !== 200)return ;
		lastPage++;
		addArticles(articles);
	});
};