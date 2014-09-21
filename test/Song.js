var mongodb = require("../");
var util = require("util");

function Song() {
	mongodb.Model.call(this);
	
	this.define("title", String);
}

util.inherits(Song, mongodb.Model);

module.exports = Song;
