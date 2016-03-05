var helper = require('./helper');

var assert = helper.assert;
var expect = helper.expect;
var eventStream = helper.eventStream;

var NativeClient = require('../lib/native-client');

describe('NativeClient', function() {
  var client = new NativeClient(helper.connection);

  before(require('mongodb-runner/mocha/before')({ port: 27018 }));
  after(require('mongodb-runner/mocha/after')());

  before(function(done) {
    client.connect(done);
  });

  describe('#new', function() {
    it('sets the model on the instance', function() {
      expect(client.model).to.equal(helper.connection);
    });
  });

  describe('#find', function() {
    before(function() {
      helper.insertTestDocuments(client);
    });

    after(function() {
      helper.deleteTestDocuments(client);
    });

    context('when a filter is provided', function() {
      it('returns a cursor for the matching documents', function(done) {
        client.find('data-service.test', { a: 1 }, {}, function(error, docs) {
          assert.equal(null, error);
          expect(docs.length).to.equal(1);
          done();
        });
      });
    });

    context('when no filter is provided', function() {
      it('returns a cursor for all documents', function(done) {
        client.find('data-service.test', {}, {}, function(error, docs) {
          assert.equal(null, error);
          expect(docs.length).to.equal(2);
          done();
        });
      });
    });

    context('when options are provided', function() {
      it('returns a cursor for the documents', function(done) {
        client.find('data-service.test', {}, { skip: 1 }, function(error, docs) {
          assert.equal(null, error);
          expect(docs.length).to.equal(1);
          done();
        });
      });
    });
  });

  describe('#collectionDetail', function() {
    it('returns the collection details', function(done) {
      client.collectionDetail('data-service.test', function(err, coll) {
        assert.equal(null, err);
        expect(coll.ns).to.equal('data-service.test');
        expect(coll.index_count).to.equal(1);
        done();
      });
    });
  });

  describe('#collectionNames', function() {
    it('returns the collection names', function(done) {
      client.collectionNames('data-service', function(err, names) {
        assert.equal(null, err);
        expect(names[0]).to.not.equal(undefined);
        done();
      });
    });
  });

  describe('#collections', function() {
    it('returns the collections', function(done) {
      client.collections('data-service', function(err, collections) {
        assert.equal(null, err);
        expect(collections[0].name).to.not.equal(undefined);
        done();
      });
    });
  });

  describe('#collectionStats', function() {
    it('returns an object with the collection stats', function(done) {
      client.collectionStats('data-service', 'test', function(err, stats) {
        assert.equal(null, err);
        expect(stats.name).to.equal('test');
        done();
      });
    });
  });

  describe('#databaseDetail', function() {
    it('returns the database details', function(done) {
      client.databaseDetail('data-service', function(err, database) {
        assert.equal(null, err);
        expect(database._id).to.equal('data-service');
        expect(database.stats.document_count).to.not.equal(undefined);
        done();
      });
    });
  });

  describe('#databaseStats', function() {
    context('when the user is authorized', function() {
      it('returns an object with the db stats', function(done) {
        client.databaseStats('native-service', function(err, stats) {
          assert.equal(null, err);
          expect(stats.document_count).to.equal(0);
          done();
        });
      });
    });

    context('when the user is not authorized', function() {
      it('passes an error to the callback');
    });
  });

  describe('#count', function() {
    context('when a filter is provided', function() {
      it('returns a count for the matching documents', function(done) {
        client.count('data-service.test', { a: 1 }, {}, function(error, count) {
          assert.equal(null, error);
          expect(count).to.equal(0);
          done();
        });
      });
    });
  });

  describe('#indexes', function() {
    it('returns the indexes', function(done) {
      client.indexes('data-service.test', function(err, indexes) {
        assert.equal(null, err);
        expect(indexes[0].name).to.equal('_id_');
        done();
      });
    });
  });

  describe('#instance', function() {
    it('returns the instance', function(done) {
      client.instance(function(err, instance) {
        assert.equal(null, err);
        expect(instance._id).to.not.equal(undefined);
        expect(instance.hostname).to.equal('localhost');
        expect(instance.port).to.equal(27018);
        expect(instance.databases[0]._id).to.not.equal(undefined);
        done();
      });
    });
  });

  describe('#sample', function() {
    before(function() {
      helper.insertTestDocuments(client);
    });

    after(function() {
      helper.deleteTestDocuments(client);
    });

    context('when no filter is provided', function() {
      it('returns a stream of sampled documents', function(done) {
        var seen = 0;
        client.sample('data-service.test')
          .pipe(eventStream.through(function(doc) {
            seen++;
            this.emit('data', doc);
          }, function() {
            this.emit('end');
            expect(seen).to.equal(2);
            done();
          }));
      });
    });
  });
});
