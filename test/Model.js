var Album = require("./Album");
var Song = require("./Song");
var assert = require("assert");

describe("achilles.Model", function() {
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
	it("should work with submodels", function(cb) {
		var album = new Album();
		album.title = "Who cares?";
		album.rating = 3;
		var song = new Song();
		song.title = "Love"; 
		album.songs = [song];
		album.save(function(err, doc) {
			if(err) {    
				throw err;
			}
			Album.getById(doc._id, function(err, doc) {
				assert(err === null);
				assert(doc.songs[0].title === "Love");
				cb();
			});
		});
	});
	it("should support updating subdocs", function(cb) {
		var album = new Album();
		album.title = "Who cares?";
		album.rating = 3;
		var song = new Song();
		song.title = "Love"; 
		album.songs = [song];
		album.save(function(err, doc) {
			assert(err === null);
			doc.songs[0].title = "Hate";
			doc.songs[0].save(function(err) {
				assert(err === null);
				Album.getById(doc._id, function(err, doc) {
					assert(err === null);
					assert(doc.songs[0].title === "Hate");
					cb();
				});
			});
		});
	});
	it("should support creating subdocs", function(cb) {
		var album = new Album();
		album.title = "Who cares? 2";
		album.rating = 2;
		var song = new Song();
		song.title = "WFSD";
		album.save(function(err) {
			assert(err === null);
			album.songs = [song];
			song.save(function(err) {
				Album.getById(album._id, function(err, doc) {
					assert(err === null);
					assert(doc.songs.length === 1);
					cb();
				});
			});
		});
	});
	it("should support deleting subdocs", function(cb) {
		var album = new Album();
		album.title = "Who cares? 2";
		album.rating = 2;
		var song = new Song();
		song.title = "WFSD";
		album.songs = [song];
		album.save(function(err) {
			assert(err === null);
			song.del(function(err) {
				assert(err === null);
				Album.getById(album._id, function(err, doc) {
					assert(err === null);
					assert(doc.songs.length === 0);
					cb();
				});
			});
		});
	});
});
