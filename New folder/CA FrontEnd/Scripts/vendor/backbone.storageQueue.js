// Очередь для сообщений о событиях которые нужно выполнить при старте приложения
// Например: После перезагрузки страницы
StorageQueue = {
	get: function () {
		return store.get('actionQueue') || [];
	},
	put: function (item) {
		var queue = store.get('actionQueue') || [];
		queue.push(item);
		store.set('actionQueue', queue);
	},
	del: function (item) {
		if (item === '*') {
			store.set('actionQueue', []);
			return;
		}

		var queue = store.get('actionQueue') || [];
		var i = queue.indexOf(item);
		if (i != -1) {
			queue.splice(i, 1);
		}
		store.set('actionQueue', queue);
	},
	check: function (item) {
		var queue = store.get('actionQueue') || [];
		return queue.indexOf(item) != -1;
	}
};