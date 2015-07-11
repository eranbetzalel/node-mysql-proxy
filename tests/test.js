var assert = require('assert');
var request = require('request');
var config = require('../config');

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
    });
});

function executeRemoteSql(query, params, callback) {
    request
        .post({
            url: 'http://localhost:' + config.web.httpPort,
            form: {query: query, params: params}
        }, function (err, res, body) {
            assert.equal(err, null);

            var result = JSON.parse(body);

            callback(result.error, result.rows, result.fields);
        });
}