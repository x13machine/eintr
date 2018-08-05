global.sidebarHTML = '';
var dir = 'templates/';

global.templates = {
	'none': function(){}
};
function load(){
	var files = fs.readdirSync(dir);
	files.forEach(function(file){
			templates[file.split('.')[0]] = handlebars.compile(fs.readFileSync(dir + file,'utf8'));
	});
}
fsmonitor.watch(dir, null, load);
load();


global.render = function(req,res,page,data){
	
	function dis(user){
		var user = user || {};
		
		function getFiles(list,type){
			var compiled = [];
			list.forEach(function(name){
				compiled.push(lookups[name + '.' + type]);
			});
			return compiled;
		}
		
		res.end(templates['layout']({
			name: user.name,
			logined: !!req.user,
			page: page,
			content: templates[page](data),
			sidebar: sidebarHTML,
			js: getFiles(config.media[page].js.concat(config.media.layout.js),'js'),
			css: getFiles(config.media[page].css.concat(config.media.layout.css),'css')
		}));
	}

	if(!req.user){
		dis();
		return ;
	}
	
	sql.query('SELECT "name" FROM "users" WHERE "ID" = $1::int', [req.user], function (err, re, fields) {
		if (err || !re.rows[0])dis();
		else dis(re.rows[0]);
	});
	

}
