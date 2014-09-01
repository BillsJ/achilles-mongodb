var Album = require("./Album");
var assert = require("assert");

describe("mongodb.Model", function() {
	it(".save()", function(done) {
		var album = new Album();
		album.title = "Whenever";
		album.rating = 5;
		album.save(function(err) {
			if(err) {
				throw err;
			}
			done();
		});
	});
	it(".getById()", function(done) {
		var album = new Album();
		album.title = "Whenever";
		album.rating = 5;
		album.save(function(err, result) {
			if(err) {
				throw err;
			}
			Album.getById(result._id, function(err, doc) {
				assert(err === null);
				assert(doc._id === result._id);
				done();
			});
		});
	});
});
