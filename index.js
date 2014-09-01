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

	this.define("saved", Boolean, {virtual:true});

	if(!this.constructor.collection) {
		this.constructor.collection = "PENDING";
		this.constructor.collection = this.constructor.connection.get(this.constructor.name);
	}
};

util.inherits(Model, achilles.Model);

Model.prototype.save = function(cb) {
	this.constructor.collection.then((function(collection) {
		if(!this.saved) {
			collection.insert(this.toJSON(), (function(err, doc) {
				if(err) {
					cb(err);
				}
				this._id = doc._id;
				cb(null, this);
			}).bind(this));
		}
	}).bind(this));
};

Model.getById = function(id, cb) {
	this.collection.then((function(collection) {
		collection.findOne({_id:id}, (function(err, doc) {
			if(err) {
				cb(err);
			} else {
				cb(null, this.parse(doc));
			}
		}).bind(this));
	}).bind(this));
};

module.exports.Model = Model;
module.exports.Connection = Connection;
