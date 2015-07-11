var assert = require('assert');
var request = require('request-json');
var config = require('../config');

var client = request.createClient('http://localhost:' + config.web.httpPort);

describe('MySQL Proxy', function () {
    before(function () {
        require('../proxy');
    });

    describe('Web Requests', function () {
        describe('Validations', function () {
            it('should return error when on empty query', function (done) {
                executeRemoteSql(null, null, function (err, rows, fields) {
                    assert.equal(err, 'Missing query parameter.');
                    assert.equal(rows, null);
                    assert.equal(fields, null);

                    done();
                });
            });
        });
    });

    describe('Queries', function () {
        this.timeout(30 * 1000);

        describe('Database information', function () {
            it('should be able to query status', function (done) {
                executeRemoteSql('SHOW STATUS', null, function (err, rows, fields) {
                    assert.equal(err, null);
                    assert.notEqual(rows, null);
                    assert.notEqual(fields, null);

                    done();
                });
            });

            it('should be able to return error on wrong query', function (done) {
                executeRemoteSql('SHOW STATUS_BLA_BLA', null, function (err, rows, fields) {
                    assert.notEqual(err, null);
                    assert.equal(rows, null);
                    assert.equal(fields, null);

                    done();
                });
            });
        });

        describe('Simple data operations', function () {
            var testDatabaseName = 'test_' + Date.now();

            before(function (done) {
                executeRemoteSql('CREATE DATABASE ' + testDatabaseName, null, function (err, rows, fields) {
                    assert.equal(err, null);

                    done();
                });
            });

            it('should be able to create a database, table and insert some data', function (done) {
                var tableName = testDatabaseName + '.test';

                executeRemoteSql('CREATE TABLE ' + tableName + ' (testColumn VARCHAR(50))', null, function (err, rows, fields) {
                    assert.equal(err, null);

                    executeRemoteSql('INSERT INTO ' + tableName + ' (testColumn) VALUES (?)', ['some data'], function (err, rows, fields) {
                        assert.equal(err, null);

                        executeRemoteSql('SELECT * FROM ' + tableName, null, function (err, rows, fields) {
                            assert.equal(err, null);
                            assert.notEqual(rows, null);
                            assert.equal(rows[0].testColumn, 'some data');

                            done();
                        });
                    });
                });
            });

            after(function (done) {
                executeRemoteSql('DROP DATABASE ' + testDatabaseName, null, function (err, rows, fields) {
                    assert.equal(err, null);

                    done();
                });
            })
        });
    });
});

function executeRemoteSql(query, params, callback) {
    client.post('', {query: query, params: params},
        function (err, res, body) {
            assert.equal(err, null);

            callback(body.error, body.rows, body.fields);
        });
}