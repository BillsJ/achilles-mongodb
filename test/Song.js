var achilles = require("achilles");
var util = require("util");

function Song() {
	achilles.Model.call(this);
	
	this.define("title", String);
}

util.inherits(Song, achilles.Model);

module.exports = Song;
