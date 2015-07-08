angular.module('starter.filters', [])

.filter('taskHeader', function() {
  return function(task) {
    if (task.taskName == null) {
      return task.taskID;
    }
    else {
      return task.taskID + ': ' + task.taskName;
    }
  };
})

.filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
});