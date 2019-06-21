
global.hashes = {};
global.lookups = {};

function cache(){
	hashes = {};
	lookups = {};
	
	var directories = [
		'public/js',
		'public/css'
	];
	
	directories.forEach(function(dir){
		dir = __dirname + '/' + dir;
		var files = fs.readdirSync(dir);
		files.forEach(function(file){
			var content = fs.readFileSync(dir + '/' + file,'utf8');
			var type = file.split('.')[1];
				
				
			var id = base(crypto.createHash('md5').update(content, 'utf8').digest('base64')) + '.' + type;
			lookups[file] = id;
			hashes[id] = {
				type: express.static.mime.lookup(type),
				content: content
			};
		});
	});
}

cache();
fsmonitor.watch(__dirname + '/public/', null, cache);

app.get('/cache/*', function(req, res, next){
	var data = hashes[req.url.split('/')[2]];
	if(!data){
		next();
		return;
	}
	
	res.set('Content-Type', data.type);
	res.end(data.content);
});
