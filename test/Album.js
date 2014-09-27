var mongodb = require("../");
var achilles = require("achilles");
var util = require("util");
var Song = require("./Song");

function Album() {
	achilles.Model.call(this);

	this.define("title", String);
	this.define("rating", Number);
	this.define("songs", [Song]);
}

util.inherits(Album, achilles.Model);

Album.connection = new mongodb.Connection("mongodb://127.0.0.1:27017/test");

module.exports = Album;
