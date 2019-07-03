function Stack(){
	stack.questions.questions({sort:'hot'}, (err, data) => {
		setTimeout(Stack,config.interval * 1000);
		if(err)return;
		var list = [];
		data.items.forEach(item => {
			if(list.length == config.stackCount)return true;
			if(item.is_answered && 0 < item.score)list.push({
				link: item.link,
				title: item.title
			});
		});
		
		redis.set('stack',JSON.stringify(list));
	});
}

Stack();
