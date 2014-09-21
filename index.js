var achilles = require("achilles");
var mongodb = require("mongodb");
var util = require("util");
var rsvp = require("rsvp");

function Connection(url) {
	this.db = new rsvp.Promise(function(resolve, reject) {
		mongodb.MongoClient.connect(url, (function(err, db) {
			if(err) {
				return reject(err);
			}
			resolve(db);
		}).bind(this));
	});
};

Connection.prototype.get = function(collectionName) {
	return new rsvp.Promise((function(resolve, reject) {
		this.db.then(function(db) {
			resolve(db.collection(collectionName));
		}, reject);
	}).bind(this));
};

Connection.prototype.close = function() {
	this.db.then(function(db) {
		db.close();
	});
};

function Model() {
	achilles.Model.call(this);

	if(!this.constructor.collection && this.constructor.connection) {
		this.constructor.collection = "PENDING";
		this.constructor.collection = this.constructor.connection.get(this.constructor.name);
	}
};

util.inherits(Model, achilles.Model);

Model.prototype.save = function(cb) {
	if(this.constructor.connection) {
		this.constructor.collection.then((function(collection) {
			collection.save(this.toJSON(), {w:1}, (function(err, record) {
				if(record._id !== this._id) {
					this._id = record._id;
				}
				if(cb) {
					cb(err, this);
				}
			}).bind(this));
		}).bind(this));
	} else {
		var str = "";
		var container = this;
		while(container.container) {
			if(container.container instanceof Array) {
				str = container.container.indexOf(container) + (str ? "." + str : "");
				container = container.container;
			}
			str = container.containerProp + (str ? "." + str : "");
			container = container.container;
		}
		var resp = new Object();
		resp[str] = this.toJSON();
		container.constructor.collection.then(function(collection) {
			collection.update({_id: new mongodb.ObjectID(container._id)}, {$set: resp}, function(err, doc) {
				cb(err, this);
			});
		}.bind(this));
	}
};

Model.prototype.refresh = function(cb) {
	var id = mongodb.ObjectID(this._id);
	this.constructor.collection.then((function(collection) {
		collection.findOne({_id:id}, function(err, doc) {
			if(err) {
				cb(err);
			} else if(!doc) {
				throw "Document not found";
			} else {
				for(var key in doc) {
					this[key] = doc[key];
				}
				cb(null, this);
			}
		}.bind(this));
	}).bind(this));
};

module.exports.Model = Model;
module.exports.Connection = Connection;
