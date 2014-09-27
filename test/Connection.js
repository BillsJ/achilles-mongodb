var mongodb = require("../");
var assert = require("assert");

describe("mongodb.Connection", function() {
	it("should connect", function(done) {
		var connection = new mongodb.Connection("mongodb://127.0.0.1:27017/test");
		connection.setup("users").then(function(db) {
			assert(db !== undefined);
			connection.close();
			done();
		});
	});
});
