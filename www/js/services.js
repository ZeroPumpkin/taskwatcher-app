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
      return localDB;
    },

    getRemoteDB: function() {
      return remoteDB;
    }
  };
})

.factory('Tasklist', function(Persist) {
  return {
    sync: function() {
      return Persist.getLocalDB().sync(remoteDB);
    },

    get: function() {
      return Persist.getLocalDB().allDocs({
        include_docs: true
      });
    },

    add: function(task) {
      return Persist.getLocalDB().put(task);
    },

    delete: function(task) {
      return Persist.getLocalDB().remove(task);
    }
  };
})

.factory('Settings', function(Persist) {
  return {
    
  };
});