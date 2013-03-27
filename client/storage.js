angular.module('storage', []).service('storage', function ($rootScope) {
	if (!('goodoo' in localStorage)) {
		localStorage.goodoo = JSON.stringify({});
	}

	saveTasks = function() {
		console.log("Saving tasks:");
		console.log($rootScope.tasks);
		var gooDooData = JSON.parse(localStorage.goodoo);
		gooDooData.tasks = $rootScope.tasks;
		localStorage.goodoo = JSON.stringify(gooDooData);
	};

	loadTasks = function() {
		var gooDooData = JSON.parse(localStorage.goodoo);
		if (gooDooData.tasks) {
			console.log("Reading tasks from local storage:");
			console.log(gooDooData.tasks);
			return gooDooData.tasks;
		} else {
			return [];
		}
	};

	// Tasks variable is in this service and not the GooDoo controller so the sync module can also access it.
	$rootScope.tasks = loadTasks(); // all tasks, done and remaining

	$rootScope.$watch('tasks', saveTasks, true);

	// Stuff exposed by the service:
	return {
		tasks: $rootScope.tasks
	};
});
