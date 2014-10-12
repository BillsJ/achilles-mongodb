var achilles = require("achilles");
var mongodb = require("mongodb");
var util = require("util");
var rsvp = require("rsvp");
var stream = require("stream");

function Connection(url) {
	this.db = new rsvp.Promise(function(resolve, reject) {
		mongodb.MongoClient.connect(url, (function(err, db) {
			if(err) {
				return reject(err);
			}
			resolve(db);
		}).bind(this));
	});
}

Connection.prototype.get = function(options, cb) {
	if(typeof options === "function") {
		cb = options;
		options = {};
		options.where = {};
	}
	var str = new stream.PassThrough({objectMode:true});
	this.collection.then(function(collection) {
		collection.find(options.where, {
			limit:options.limit,
			skip:options.skip,
			sort:options.sort
		},
		function(err, docs) {
			if(err) {
				cb(err);
			} else {
				if(cb) {
					docs.toArray(function(err, docs) {
						docs = docs.map(function(doc) {
							var y= new this();
							y._data = doc;
							return y;
						}.bind(this));
						cb(null, docs);
					}.bind(this));
				}
				docs.stream().pipe(str);
			}
		}.bind(this));
	}.bind(this));
	return str;
};

Connection.prototype.setup = function(collectionName) {
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

Connection.prototype.save = function(cb) {
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
		if(this._id) {
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
				}.bind(this));
			}.bind(this));
		} else {
			var container = this.container;
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
				collection.update({_id: new mongodb.ObjectID(container._id)}, {$push: resp}, function(err, doc) {
					cb(err, this);
				}.bind(this));
			}.bind(this));
		}
	}
};

Connection.prototype.refresh = function(cb) {
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

Connection.prototype.del = function(cb) {
	if(!this.container) {
		this.constructor.collection.then(function(collection) {
			collection.remove({_id: new mongodb.ObjectID(this._id)}, function(err) {
				cb(err, this);
			});
		}.bind(this));
	} else {
		var str = "";
		var container = this.container;
		while(container.container) {
			if(container.container instanceof Array) {
				str = container.container.indexOf(container) + (str ? "." + str : "");
				container = container.container;
			}
			str = container.containerProp + (str ? "." + str : "");
			container = container.container;
		}
		var resp = new Object();
		resp[str] = {_id: this._id};
		container.constructor.collection.then(function(collection) {
			collection.update({_id: new mongodb.ObjectID(container._id)}, {$pull: resp}, function(err) {
				cb(err, this);
			}.bind(this));
		}.bind(this));
	}
};

module.exports.Connection = Connection;
