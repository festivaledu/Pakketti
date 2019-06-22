'use strict';

const WritableStream = require('stream').Writable;
const EventEmitter = require('events').EventEmitter;
const mime = require('mime');
const httpStatus = require("http-status");
var utils = require('./utils');

function createResponse(options) {

    if (!options) {
        options = {};
    }

    var _endCalled = false;
    var _data = '';
    var _buffer = Buffer.alloc(0);
    var _chunks = [];
    var _size = 0;
    var _encoding = options.encoding;

    var _redirectUrl = '';
    var _renderView = '';
    var _renderData = {};

    if (options.writableStream) {
        WritableStream = options.writableStream;
    }
    if (options.eventEmitter) {
        EventEmitter = options.eventEmitter;
    }
    var writableStream = new WritableStream();

    var requestWrapper = options.req;

    var responseWrapper = Object.create(EventEmitter.prototype);
    EventEmitter.call(responseWrapper);

    responseWrapper._headers = {};

    responseWrapper.cookies = {};
    responseWrapper.finished = false;
    responseWrapper.headersSent = false;
    responseWrapper.statusCode = 200;
    responseWrapper.statusMessage = 'OK';

    // http://expressjs.com/en/api.html#res.locals
    responseWrapper.locals = options.locals || {};

    responseWrapper.cookie = function(name, value, opt) {

        responseWrapper.cookies[name] = {
            value: value,
            options: opt
        };

        return this;
    };

    responseWrapper.clearCookie = function(name, opt) {
        var opts = opt || {};
        opts.expires = new Date(1);
        opts.path = '/';

        return this.cookie(name, '', opts);
    };

    responseWrapper.status = function(code) {
        responseWrapper.statusCode = code;
        return this;
    };

    responseWrapper.writeHead = function(statusCode, statusMessage, headers) {

        if (_endCalled) {
            throw new Error('The end() method has already been called.');
        }

        if (responseWrapper.headersSent) {
            return;
        }

        responseWrapper.statusCode = statusCode;

        if (Object.prototype.toString.call(statusMessage) === '[object Object]') {
            headers = statusMessage;
            statusMessage = null;
        }

        if (statusMessage) {
            responseWrapper.statusMessage = statusMessage;
        }

        if (headers) {
            Object.assign(responseWrapper._headers, utils.convertKeysToLowerCase(headers));
        }

    };

    responseWrapper.send = function(a, b, c) {

        var _formatData = function(data) {

            if (typeof data === 'object') {

                if (data.statusCode) {
                    responseWrapper.statusCode = data.statusCode;
                } else if (data.httpCode) {
                    responseWrapper.statusCode = data.httpCode;
                }

                if (data.body) {
                    _data = data.body;
                } else {
                    _data = data;
                }

            } else {
                _data += data;
            }

        };

        switch (arguments.length) {
            case 1:
                if (typeof a === 'number') {
                    responseWrapper.statusCode = a;
                } else {
                    _formatData(a);
                }
                break;

            case 2:
                if (typeof a === 'number') {
                    _formatData(b);
                    responseWrapper.statusCode = a;
                } else if (typeof b === 'number') {
                    _formatData(a);
                    responseWrapper.statusCode = b;
                    console.warn('WARNING: Called send() with deprecated parameter order');
                } else {
                    _formatData(a);
                    _encoding = b;
                }
                break;

            case 3:
                _formatData(a);
                responseWrapper._headers = utils.convertKeysToLowerCase(b);
                responseWrapper.statusCode = c;
                console.warn('WARNING: Called send() with deprecated three parameters');
                break;

            default:
                break;
        }

        responseWrapper.headersSent = true;

        responseWrapper.emit('send');
        responseWrapper.end();

    };

    responseWrapper.sendStatus = function sendStatus(statusCode) {
        var body = httpStatus[statusCode] || String(statusCode);

        responseWrapper.statusCode = statusCode;
        responseWrapper.type('txt');

        return responseWrapper.send(body);
    };

    responseWrapper.json = function(a, b) {

        responseWrapper.setHeader('Content-Type', 'application/json');
        if (typeof a !== 'undefined') {
            if (typeof a === 'number' && typeof b !== 'undefined') {
                responseWrapper.statusCode = a;
                responseWrapper.write(JSON.stringify(b), 'utf8');
            } else if(typeof b !== 'undefined' && typeof b === 'number') {
                responseWrapper.statusCode = b;
                responseWrapper.write(JSON.stringify(a), 'utf8');
            } else {
                responseWrapper.write(JSON.stringify(a), 'utf8');
            }
        }
        responseWrapper.emit('send');
        responseWrapper.end();

    };

    responseWrapper.jsonp = function(a, b) {

        responseWrapper.setHeader('Content-Type', 'text/javascript');
        if (typeof a !== 'undefined') {
            if (typeof a === 'number' && typeof b !== 'undefined') {
                responseWrapper.statusCode = a;
                _data += JSON.stringify(b);
            } else if(typeof b !== 'undefined' && typeof b === 'number') {
                responseWrapper.statusCode = b;
                _data += JSON.stringify(a);
            } else {
                _data += JSON.stringify(a);
            }
        }
        responseWrapper.emit('send');
        responseWrapper.end();

    };

    responseWrapper.contentType = responseWrapper.type = function(type) {
        return responseWrapper.set('Content-Type', type.indexOf('/') >= 0 ? type : mime.lookup(type));
    };

    responseWrapper.location = function(location) {
        return responseWrapper.set('Location', location);
    };

    responseWrapper.write = function(data, encoding) {

        responseWrapper.headersSent = true;

        if (data instanceof Buffer) {
            _chunks.push(data);
            _size += data.length;
        } else {
            _data += data;
        }

        if (encoding) {
            _encoding = encoding;
        }

    };

    responseWrapper.end = function(data, encoding) {
        if (_endCalled) {
            return;
        }

        responseWrapper.finished = true;
        responseWrapper.headersSent = true;

        _endCalled = true;

        if (data) {
            if (data instanceof Buffer) {
                _chunks.push(data);
                _size += data.length;
            } else {
                _data += data;
            }
        }

        if (_chunks.length) {
            switch (_chunks.length) {
                case 1:
                    _buffer = _chunks[0];
                    break;
                default:
                    _buffer = Buffer.alloc(_size);
                    for (var i = 0, pos = 0, l = _chunks.length; i < l; i++) {
                        var chunk = _chunks[i];
                        chunk.copy(_buffer, pos);
                        pos += chunk.length;
                    }
                    break;
            }
        }

        if (encoding) {
            _encoding = encoding;
        }

        responseWrapper.emit('end');
        responseWrapper.emit('finish');

    };

    responseWrapper.vary = function(fields) {
        var header = responseWrapper.getHeader('Vary') || '';
        var values = header.length ? header.split(', ') : [];

        fields = Array.isArray(fields) ? fields : [ fields ];

        fields = fields.filter(function(field) {
            var regex = new RegExp(field, 'i');

            var matches = values.filter(function(value) {
                return value.match(regex);
            });

            return !matches.length;
        });

        values = values.concat(fields);

        return responseWrapper.setHeader('Vary', values.join(', '));
    };

    responseWrapper.append = function append(field, val) {
        var prev = responseWrapper.get(field);
        var value = val;

        if (prev) {
            value = Array.isArray(prev) ? prev.concat(val)
                : Array.isArray(val) ? [prev].concat(val)
                    : [prev, val];
        }

        return responseWrapper.set(field, value);
    };

    responseWrapper.set = responseWrapper.header = function header(field, val) {
        if (arguments.length === 2) {
            if (Array.isArray(val)) {
                val = val.map(String);
            } else {
                val = String(val);
            }
            responseWrapper.setHeader(field, val);
        } else if (typeof field === 'string') {
            return responseWrapper.getHeader(field);
        } else { // eslint-disable-line
            for (var key in field) {
                responseWrapper.setHeader(key, field[key]);
            }
        }
        return responseWrapper;
    };

    responseWrapper.get = responseWrapper.getHeader = function(name) {
        return responseWrapper._headers[name.toLowerCase()];
    };

    responseWrapper.setHeader = function(name, value) {
        responseWrapper._headers[name.toLowerCase()] = value;
        return value;
    };

    responseWrapper.removeHeader = function(name) {
        delete responseWrapper._headers[name.toLowerCase()];
    };

    responseWrapper.setEncoding = function(encoding) {
        _encoding = encoding;
    };

    responseWrapper.getEncoding = function() {
        return _encoding;
    };

    responseWrapper.redirect = function(a, b) {
        switch (arguments.length) {
            case 1:
                responseWrapper.statusCode = 302;
                _redirectUrl = a;
                break;

            case 2:
                if (typeof a === 'number') {
                    responseWrapper.statusCode = a;
                    _redirectUrl = b;
                }
                break;

            default:
                break;
        }
        responseWrapper.end();
    };

    responseWrapper.render = function(a, b) {
        _renderView = a;

        switch (arguments.length) {
            case 2:
                _renderData = b;
                break;

            default:
                break;
        }

        responseWrapper.emit('render');
        responseWrapper.end();

    };

    responseWrapper.format = function(supported) {
        supported = supported || {};
        var types = Object.keys(supported);

        if (types.length === 0) {
            return responseWrapper.sendStatus(406);
        }

        if (!requestWrapper) {
            throw new Error(
                'Request object unavailable. Use createMocks or pass in a ' +
                    'request object in createResponse to use format.'
            );
        }

        var accepted = requestWrapper.accepts(types);

        if (accepted) {
            return supported[accepted]();
        }

        if (supported.default) {
            return supported.default();
        }

        return responseWrapper.sendStatus(406);
    };

    responseWrapper.destroy = function() {
        return writableStream.destroy.apply(this, arguments);
    };

    responseWrapper.destroySoon = function() {
        return writableStream.destroySoon.apply(this, arguments);
	};
	
	responseWrapper._getData = function() {
        return _data;
    };

    responseWrapper._getJSONData = function() {
        return JSON.parse(_data);
    };

    return responseWrapper;

}

module.exports.createResponse = createResponse;