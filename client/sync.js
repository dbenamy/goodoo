angular.module('goodoo').service('sync', function ($rootScope, $timeout, storage, net) {

	var status = {
		syncing: false,
		text: ''
	};

	var syncTimer = null;

	// TODO handle errors uploading and downloading
	var sync = function() {
		if (status.syncing) {
			return;
		}
		$timeout.cancel(syncTimer);
		status.syncing = true;
		status.text = "Syncing...";
		net.downloadData(function(str) {
			_mergeServerData(str);
			var upload = {
				tasks: storage.tasks
				// tags: data.tags
			};
			net.uploadData(JSON.stringify(upload), syncDone);
		});
	};

	$rootScope.$watch(storage.tasks, sync, true);

	var _mergeServerData = function(str) {
		var json = {tasks: []}; //, tags: []};
		if (str !== '') {
			json = JSON.parse(str);
		}
		_mergeTasks(storage.tasks, json.tasks);
		// _mergeTags(data.tags, json.tags);
	};

	/**
	 * Merges serverTasks into clientTasks, modifying clientTasks
	 * clientTasks should be the array of tasks in the app.
	 * serverTasks should be the array of tasks downloaded from the server.
	 */
	var _mergeTasks = function(clientTasks, serverTasks) {
		console.log('Merging tasks:');
		console.log(clientTasks);
		console.log(serverTasks);
		var serverTasksById = _tasksById(serverTasks);
		$.each(clientTasks, function(i, task) {
			console.log('Looking at client task ' + i);
			console.log(task);
			if (task.id in serverTasksById) {
				var serverTask = serverTasksById[task.id];
				delete serverTasksById[task.id];
				// Skip fancy merging for now and just use all data from most recently updated.
				// $.each(['text', 'done'], function(id, field) {
				// 	if (serverTask[field].lastUpdated > task[field].lastUpdated) {
				// 		task[field] = serverTask[field];
				// 	}
				// });
				// var tags = task.get('tags');
				// $.each(tags, function(tag, info) {
				// 	if (tag in serverTask.tags) {
				// 		if (serverTask.tags[tag].lastUpdated > info.lastUpdated) {
				// 			tags[tag] = serverTask.tags[tag];
				// 		}
				// 		delete serverTask.tags[tag];
				// 	}
				// });
				// // Any tags left in serverTask.tags don't exist in (client) task and
				// // should be added.
				// $.each(serverTask.tags, function(tag, info) {
				// 	tags[tag] = info;
				// });
				// task.set({tags: tags});
				if (serverTask.lastUpdated > task.lastUpdated) {
					task.text = serverTask.text;
					task.tags = serverTask.tags;
					task.done = serverTask.done;
					task.lastUpdated = serverTask.lastUpdated;
				}
			}
		});
		// Anything left in serverTasksById doesn't exist in clientTasks and
		// should be added to the result.
		$.each(serverTasksById, function(id, serverTask) {
			clientTasks.push(serverTask);
		});
		console.log('Merged. New tasks:');
		console.log(clientTasks);
	};

	var _tasksById = function(tasks) {
		var res = {};
		$.each(tasks, function(i, task) {
			res[task.id] = task;
		});
		return res;
	};

	// /**
	//  * Merges serverTags into clientTags, modifying clientTags.
	//  */
	// _mergeTags = function(clientTags, serverTags) {
	// 	console.log('Merging tags:');
	// 	console.log(clientTags);
	// 	console.log(serverTags);
	// 	var serverTagsByName = {};
	// 	$.each(serverTags, function(i, tag) {
	// 		serverTagsByName[tag.name] = tag;
	// 	});
	// 	clientTags.each(function(tag) {
	// 		if (tag.get('name') in serverTagsByName) {
	// 			var serverTag = serverTagsByName[tag.get('name')];
	// 			delete serverTagsByName[tag.get('name')];
	// 			if (serverTag.lastUpdated > tag.get('lastUpdated')) {
	// 				tag.set(serverTag);
	// 			}
	// 		}
	// 	});
	// 	$.each(serverTagsByName, function(name, tag) {
	// 		clientTags.add(tag, {silent: true});
	// 	});
	// 	clientTags.trigger('add');
	// 	console.log('Merged. New tags:');
	// 	console.log(clientTags);
	// };

	var syncDone = function() {
		$rootScope.$apply(function() {
			status.syncing = false;
			status.text = "Last synced at " + (new Date()); // TODO make this prettier
			syncTimer = $timeout(sync, 30000);
		});
	};

	return {
		sync: sync,
		status: status,
		downloadAsFile: net.downloadAsFile
	};
});