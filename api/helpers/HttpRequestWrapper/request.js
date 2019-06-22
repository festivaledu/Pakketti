'use strict';

const url = require('url');
const EventEmitter = require('events').EventEmitter;
const utils = require('./utils');

var standardRequestOptions = [
    'method', 'url', 'originalUrl', 'baseUrl', 'path', 'params', 'session', 'cookies', 'headers', 'body', 'query', 'files'
];

function createRequest(options) {
	if (!options) {
		options = {};
	}

	if (options.eventEmitter) {
		EventEmitter = options.eventEmitter;
	}

	var requestWrapper = Object.create(EventEmitter.prototype);
	EventEmitter.call(requestWrapper);

	requestWrapper.method = options.method ? options.method : 'GET';
	requestWrapper.url = options.url || options.path || '';
	requestWrapper.originalUrl = options.originalUrl || requestWrapper.url;
	requestWrapper.baseUrl = options.baseUrl || requestWrapper.url;
	requestWrapper.path = options.path ||
		((options.url ? url.parse(options.url).pathname : ''));
	requestWrapper.params = options.params ? options.params : {};
	if (options.session) {
		requestWrapper.session = options.session;
	}
	requestWrapper.cookies = options.cookies ? options.cookies : {};
	if (options.signedCookies) {
		requestWrapper.signedCookies = options.signedCookies;
	}
	requestWrapper.headers = options.headers ? utils.convertKeysToLowerCase(options.headers) : {};
	requestWrapper.body = options.body ? options.body : {};
	requestWrapper.query = options.query ? options.query : {};
	requestWrapper.files = options.files ? options.files : {};

	if (Object.keys(requestWrapper.query).length === 0) {
		requestWrapper.query = require('querystring').parse(requestWrapper.url.split('?')[1]);

		if (!requestWrapper.query.hasOwnProperty) {
			Object.defineProperty(
				requestWrapper.query,
				'hasOwnProperty',
				{
					enumerable: false,
					value: Object.hasOwnProperty.bind(requestWrapper.query)
				}
			);
		}
	}
	
	for (var n in options) {
        if (standardRequestOptions.indexOf(n) === -1) {
            requestWrapper[n] = options[n];
        }
    }
	
	requestWrapper.get =
    requestWrapper.header = function(name) {
        name = name.toLowerCase();
        switch (name) {
            case 'referer':
            case 'referrer':
                return requestWrapper.headers.referrer || requestWrapper.headers.referer;
            default:
                return requestWrapper.headers[name];
        }
    };

	return requestWrapper;
}

module.exports.createRequest = createRequest;