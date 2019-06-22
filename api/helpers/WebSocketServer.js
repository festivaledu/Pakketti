const ws = require("ws");

const controllers = require("../controllers");
const authHelper = require("./AuthHelper");

class RequestWrapper {
	constructor(models, options) {
		this.options = Object.assign({
			headers: {},
			body: null,
			method: "GET",
			path: ""
		}, options);
		
		this.account = null;
		this.models = models;
	}
	
	async init() {
		await authHelper(this, null, () => {});
	}
	
	get headers() {
		return this.options.headers;
	}
	
	get body() {
		return this.options.body;
	}
	
	get method() {
		return this.options.method;
	}
	
	get path() {
		return this.options.path;
	}
}

class ResponseWrapper {
	constructor() {
		this._status = -1;
	}
	
	status(statusCode) {
		this._status = statusCode;
		return this;
	}
	
	send(content) {
		return content;
	}
}

module.exports = (models, port = 62486) => {
	let mappedMethods = {};
	
	const map = (path, layer) => {
		if (layer.route) {
			layer.route.stack.forEach(map.bind(null, path.concat(split(layer.route.path))))
		} else if (layer.name === 'router' && layer.handle.stack) {
			layer.handle.stack.forEach(map.bind(null, path.concat(split(layer.regexp))))
		} else if (layer.method) {
			if (!mappedMethods[layer.method]) mappedMethods[layer.method] = {};
			
			const route = path.concat(split(layer.regexp)).filter(Boolean).join('/');
			mappedMethods[layer.method][route] = layer.handle;
		}
	}
	const split = (path) => {
		if (typeof path === 'string') {
			return path.split('/')
		} else if (path.fast_slash) {
			return ''
		} else {
			var match = path.toString()
				.replace('\\/?', '')
				.replace('(?=\\/|$)', '$')
				.match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//)
			return match
				? match[1].replace(/\\(.)/g, '$1').split('/')
				: '<complex:' + path.toString() + '>'
		}
	}
	
	controllers.stack.forEach(map.bind(null, []));
	
	let socket = new ws.Server({ port: port });
	
	socket.on("connection", (ws) => {
		ws.on('message', (data) => {
			(async () => {
				let rq = new RequestWrapper(models, JSON.parse(data));
				await rq.init();

				let rs = new ResponseWrapper();

				const response = await mappedMethods[rq.method.toLowerCase()][rq.path](rq, rs);
				ws.send(JSON.stringify({
					status: rs._status,
					data: response
				}));
			})();
		});

		ws.on('close', () => {

		});
	});
	
	return socket;
}