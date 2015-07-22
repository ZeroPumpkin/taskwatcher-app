angular.module('starter.services', [])

.factory('Persist', function() {
  var localDB = new PouchDB('taskwatcher');
  var remoteDB = null;

  var remoteDBSuffix = null;

  return {
    setRemoteDBSuffix: function(suffix) {
      remoteDBSuffix = suffix;
      remoteDB = new PouchDB('http://www.zeropumpkin.iriscouch.com/taskwatcher-' + suffix);
    },

    getLocalDB: function() {
      if (!localDB) console.error('localDB is not defined');
      return localDB;
    },

    getRemoteDB: function() {
      if (!remoteDB) console.error('remoteDB is not defined');
      return remoteDB;
    },

    sync: function() {
      return localDB.sync(remoteDB);
    }
  };
})

.factory('Tasklist', function(Persist) {
  return {
    get: function() {
      /*return Persist.getLocalDB().allDocs({
        include_docs: true
      });*/
      return Persist.getLocalDB().query('tasks/tasks', { include_docs: true });
    },

    add: function(task) {
      return Persist.getLocalDB().put(task);
    },

    delete: function(task) {
      return Persist.getLocalDB().remove(task);
    }
  };
})