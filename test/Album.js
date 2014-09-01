var mongodb = require("../");
var util = require("util");

function Album() {
	mongodb.Model.call(this);

	this.define("title", String);
	this.define("rating", Number);
}

util.inherits(Album, mongodb.Model);

Album.connection = new mongodb.Connection("mongodb://127.0.0.1:27017/test");

module.exports = Album;
