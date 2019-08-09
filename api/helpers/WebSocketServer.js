const SocketIO = require("socket.io");
const HttpRequestWrapper = require("./HttpRequestWrapper");

const controllers = require("../controllers");
const authHelper = require("./AuthHelper");

module.exports = (models, port = 62486) => {
	let mappedMethods = {};
	
	const map = (path, regexp, keys, layer) => {
		if (layer.route) {
			layer.route.stack.forEach(map.bind(null, path.concat(split(layer.route.path)), layer.regexp.toString().replace(/^\/\^(.+)\$\/i/, `^${path.join("\\/")}$1$`), layer.keys))
		} else if (layer.name === 'router' && layer.handle.stack) {
			layer.handle.stack.forEach(map.bind(null, path.concat(split(layer.regexp)), null, null))
		} else if (layer.method) {
			if (!mappedMethods[layer.method]) mappedMethods[layer.method] = {};
			
			const route = path.concat(split(layer.regexp)).filter(Boolean).join('/');
			mappedMethods[layer.method]["/" + route] = {
				handle: layer.handle,
				regexp: regexp,
				keys: keys
			}
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
	
	controllers.stack.forEach(map.bind(null, [], null, null));
	
	let socket = SocketIO(port);
	
	socket.on("connection", (ws) => {
		ws.on('message', (data) => {
			(async () => {
				const _data = JSON.parse(data);
				
				let rq = new HttpRequestWrapper.Request.createRequest(Object.assign(_data, {
					models: models
				}));
				await authHelper(rq, null, () => {});
				
				let rs = new HttpRequestWrapper.Response.createResponse({
					req: rq
				});

				if (mappedMethods[rq.method.toLowerCase()][rq.path]) {
					await mappedMethods[rq.method.toLowerCase()][rq.path].handle(rq, rs);
				} else {
					let route = Object.values(mappedMethods[rq.method.toLowerCase()]).find(_route => {
						let match = rq.path.match(new RegExp(_route.regexp));
						
						if (match) {
							if (_route.keys) {
								Object.values(_route.keys).forEach((keyObj, index) => {
									rq.params[keyObj.name] = match[index + 1]
								});
							}
							
							return _route;
						}
					});
					
					if (!route) {
						return ws.send(JSON.stringify({
							_rqid: _data._rqid,
							statusCode: 404,
							body: `Cannot ${rq.method} /api/${rq.path}'`
						}));
					}
					
					await route.handle(rq, rs)
				}

				ws.send(JSON.stringify(Object.assign(rs, {
					_rqid: _data._rqid,
					body: rs._getData()
				})));
			})();
		});

		ws.on('close', () => {

		});
	});
	
	return socket;
}